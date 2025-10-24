// src/features/insights/hooks/use-insights-data.ts

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { supabase } from '../../../lib/supabase';
import { useConfig } from '../../../hooks/use-config';
import { useAuth } from '../../../hooks/use-auth';
import type { InsightsData, AssetDataCacheRow, InsightItem, AnalystFirmStat } from '../types/insights.types';
import type { AssetData } from '../../../types/dashboard';
import { toInsightItem, sortUndervalued, sortOvervalued, filterAndSortHighRoicLowPe } from '../lib/helpers';
import { usePlanFeature } from '../../../hooks/use-plan-feature';

/**
 * Hook que arma las listas de insights a partir del cache, sin consumir API.
 * Respeta límites por plan desde runtime config y limita listas de analistas
 * si el plan no incluye Stock Grades.
 */
export function useInsightsData(opts?: { from?: Date | null; to?: Date | null; periodDays?: number }) {
  const config = useConfig();
  const { profile } = useAuth();
  const role = profile?.role ?? 'basico';
  const insightsCfg = config.insights ?? {
    maxItems: { basico: 5, plus: 20, premium: 100, administrador: 1000 },
    updatedWithinHours: 48,
  };
  const maxItems: number = insightsCfg.maxItems[role] ?? 5;
  const { hasAccess: hasStockGrades } = usePlanFeature('stockGrades');
  const gradesDaysDefault = Number(opts?.periodDays ?? config.insights?.gradesWithinDays ?? 30);
  const lowerBoundOpt = opts?.from ?? null;
  const upperBound = opts?.to ?? null;

  // Construimos una queryKey estable: si no hay "from" explícito,
  // incluimos el número de días como marcador en lugar de una fecha dinámica.
  const queryKey = React.useMemo(() => {
    const lbPart = lowerBoundOpt ? lowerBoundOpt.toISOString() : `DAYS-${gradesDaysDefault}`;
    const ubPart = upperBound ? upperBound.toISOString() : null;
    return ['insights', role, maxItems, hasStockGrades, insightsCfg.updatedWithinHours, gradesDaysDefault, lbPart, ubPart] as const;
  }, [role, maxItems, hasStockGrades, insightsCfg.updatedWithinHours, gradesDaysDefault, lowerBoundOpt, upperBound]);

  return useQuery<InsightsData>({
    queryKey,
    queryFn: async () => {
      const hours: number = insightsCfg.updatedWithinHours;
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      // 1) Traer filas recientes del cache
      const { data, error } = await supabase
        .from('asset_data_cache')
        .select('symbol, data, last_updated_at')
        .gte('last_updated_at', cutoff)
        .limit(5000);
      if (error) throw error;

  const allRows = (data ?? []) as { symbol: string; data: unknown; last_updated_at: string }[];

      // 2) Separar datos de activos vs. calificaciones de analistas
      const assetRows: AssetDataCacheRow[] = [];
  interface MinimalGrade { newGrade?: string; grade?: string; gradingCompany?: string; newsPublisher?: string; date?: string; publishedDate?: string; }
  const gradesRows: { symbol: string; grades: MinimalGrade[] }[] = [];

      for (const r of allRows) {
        if (r.symbol.startsWith('stock_grades_')) {
          const arr = Array.isArray(r.data) ? (r.data as unknown as MinimalGrade[]) : [];
          gradesRows.push({ symbol: r.symbol.replace('stock_grades_', ''), grades: arr });
        } else {
          // Heurística: debe tener currentPrice para considerarlo AssetData
          const d = r.data as Record<string, unknown> | null | undefined;
          if (d && typeof d === 'object' && 'currentPrice' in d) {
            assetRows.push(r as unknown as AssetDataCacheRow);
          }
        }
      }

      // Cargar calificaciones desde cache del último período más amplio (p. ej., 30 días)
      {
        const gradesDays = Number(opts?.periodDays ?? config.insights?.gradesWithinDays ?? 30);
        const cutoffGrades = new Date(Date.now() - gradesDays * 24 * 60 * 60 * 1000).toISOString();
        const { data: gdata, error: gerr } = await supabase
          .from('asset_data_cache')
          .select('symbol, data, last_updated_at')
          .like('symbol', 'stock_grades_%')
          .gte('last_updated_at', cutoffGrades)
          .limit(5000);

        if (!gerr && Array.isArray(gdata)) {
          const seen = new Set(gradesRows.map(r => r.symbol));
          for (const gr of gdata) {
            const sym = String(gr.symbol).replace('stock_grades_', '');
            if (seen.has(sym)) continue;
            const arr = Array.isArray(gr.data) ? (gr.data as unknown as MinimalGrade[]) : [];
            gradesRows.push({ symbol: sym, grades: arr });
          }
        }
      }

      // Mapa auxiliar para obtener companyName y price por símbolo
      const assetMap = new Map<string, InsightItem>();
      const isAssetData = (x: unknown): x is AssetData => !!x && typeof x === 'object' && 'symbol' in (x as Record<string, unknown>) && 'currentPrice' in (x as Record<string, unknown>);
      const items: InsightItem[] = assetRows
        .map((r) => {
          const data = isAssetData(r.data) ? r.data : undefined;
          if (!data) return undefined;
          const it = toInsightItem(data);
          assetMap.set(it.symbol, it);
          return it;
        })
        .filter((it): it is InsightItem => !!it);

      // 3) Rankings de valoración (DCF)
      const undervaluedAll: InsightItem[] = Array.isArray(items)
        ? sortUndervalued(items).filter(i => typeof i.mispricingPct === 'number' && i.mispricingPct > 0)
        : [];
      const overvaluedAll: InsightItem[] = Array.isArray(items)
        ? sortOvervalued(items).filter(i => typeof i.mispricingPct === 'number' && i.mispricingPct < 0)
        : [];
      // 3b) ROIC alto y PER bajo
      const highRoicLowPeAll: InsightItem[] = Array.isArray(items)
        ? filterAndSortHighRoicLowPe(items)
        : [];

      // 4) Estadísticas de analistas a partir de grades
      type Bucket = 'buy' | 'hold' | 'sell';
      const toBucket = (grade: string): Bucket => {
        const g = (grade || '').toLowerCase();
        if (
          g.includes('strong buy') || g.includes('compra fuerte') ||
          g.includes('buy') || g.includes('comprar') ||
          g.includes('outperform') || g.includes('superar') ||
          g.includes('overweight') || g.includes('sobreponderado') ||
          g.includes('positive')
        ) return 'buy';
        if (
          g.includes('hold') || g.includes('mantener') || g.includes('neutral') ||
          g.includes('equal') || g.includes('market perform') || g.includes('sector perform') ||
          g.includes('en línea')
        ) return 'hold';
        return 'sell';
      };

      // Agregados por símbolo y por firma
      const symbolAgg = new Map<string, { buy: number; hold: number; sell: number }>();
      const firmAgg = new Map<string, { buy: number; hold: number; sell: number }>();

      // Determinar los límites de fecha en tiempo de ejecución
      const defaultCutoff = new Date(Date.now() - gradesDaysDefault * 24 * 60 * 60 * 1000);
      const lowerBound = lowerBoundOpt ?? defaultCutoff;

      for (const row of gradesRows) {
        for (const g of row.grades) {
          const gDate = new Date(g.publishedDate ?? g.date ?? Date.now());
          if (gDate < lowerBound) continue; // filtrar por fecha mínima
          if (upperBound && gDate > upperBound) continue; // filtrar por fecha máxima
          const newGrade = String(g?.newGrade ?? g?.grade ?? '-');
          const firm = String(g?.gradingCompany ?? g?.newsPublisher ?? 'Desconocido');
          const bucket = toBucket(newGrade);

          const sKey = row.symbol;
          const s = symbolAgg.get(sKey) ?? { buy: 0, hold: 0, sell: 0 };
          s[bucket] += 1; symbolAgg.set(sKey, s);

          const f = firmAgg.get(firm) ?? { buy: 0, hold: 0, sell: 0 };
          f[bucket] += 1; firmAgg.set(firm, f);
        }
      }

      // 4.a) Construir rankings de símbolos
      const analystBySymbol: InsightItem[] = Array.from(symbolAgg.entries()).map(([symbol, c]) => {
        const base = assetMap.get(symbol);
        const total = c.buy + c.hold + c.sell;
        return {
          symbol,
          companyName: base?.companyName ?? symbol,
          currentPrice: base?.currentPrice ?? 0,
          priceTarget: base?.priceTarget,
          buyCount: c.buy,
          holdCount: c.hold,
          sellCount: c.sell,
          buyRatio: total ? c.buy / total : 0,
          sellRatio: total ? c.sell / total : 0,
        } satisfies InsightItem;
      });

      const analystBuyAll = analystBySymbol
        .slice()
        .sort((a, b) => (b.buyCount ?? 0) - (a.buyCount ?? 0) || (b.buyRatio ?? 0) - (a.buyRatio ?? 0));
      const analystSellAll = analystBySymbol
        .slice()
        .sort((a, b) => (b.sellCount ?? 0) - (a.sellCount ?? 0) || (b.sellRatio ?? 0) - (a.sellRatio ?? 0));

      // 4.b) Top firmas compradoras y vendedoras
      const firms: AnalystFirmStat[] = Array.from(firmAgg.entries()).map(([firm, c]) => {
        const total = c.buy + c.hold + c.sell;
        return { firm, buy: c.buy, hold: c.hold, sell: c.sell, total, buyRatio: total ? c.buy / total : 0, sellRatio: total ? c.sell / total : 0 };
      });
      const topBuyers = firms.slice().sort((a, b) => b.buyRatio - a.buyRatio || b.buy - a.buy).slice(0, Math.min(10, maxItems));
      const topSellers = firms.slice().sort((a, b) => b.sellRatio - a.sellRatio || b.sell - a.sell).slice(0, Math.min(10, maxItems));

      const analystLimit: number = hasStockGrades ? maxItems : Math.min(3, maxItems);

      return {
        undervalued: undervaluedAll.slice(0, maxItems),
        overvalued: overvaluedAll.slice(0, maxItems),
        highRoicLowPe: highRoicLowPeAll.slice(0, maxItems),
        analystBuys: analystBuyAll.slice(0, analystLimit),
        analystSells: analystSellAll.slice(0, analystLimit),
        analystFirms: { topBuyers, topSellers },
      } satisfies InsightsData;
    },
    staleTime: 5 * 60 * 1000,
  });
}
