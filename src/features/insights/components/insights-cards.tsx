// src/features/insights/components/insights-cards.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import type { InsightItem } from '../types/insights.types';
import { Card, CardContent } from '../../../components/ui/card';
import { TrendingUp, TrendingDown, Target, DollarSign, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';

export interface InsightsCardsProps {
  title: string;
  subtitle?: string;
  items: InsightItem[];
  kind: 'undervalued' | 'overvalued' | 'analystBuy' | 'analystSell';
}

/**
 * Componente que muestra insights en formato de cards visualmente atractivas.
 * Cada card muestra el activo con métricas destacadas y navegación al detalle.
 * 
 * @example
 * ```tsx
 * <InsightsCards
 *   title="Más Infravaloradas"
 *   items={undervaluedAssets}
 *   kind="undervalued"
 * />
 * ```
 */
export const InsightsCards: React.FC<InsightsCardsProps> = ({ title, subtitle, items, kind }) => {
  return (
    <div className="space-y-3">
      <div className="px-2 sm:px-0">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 px-2 sm:px-0">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-6">No hay resultados para mostrar.</div>
        ) : (
          items.map((item) => (
            <AssetInsightCard key={item.symbol} item={item} kind={kind} />
          ))
        )}
      </div>
    </div>
  );
};

interface AssetInsightCardProps {
  item: InsightItem;
  kind: InsightsCardsProps['kind'];
}

/**
 * Card individual para mostrar un activo con sus métricas de insight.
 */
const AssetInsightCard: React.FC<AssetInsightCardProps> = ({ item, kind }) => {
  const isValuation = kind === 'undervalued' || kind === 'overvalued';
  const isUndervalued = kind === 'undervalued';
  
  return (
    <NavLink to={`/asset/${item.symbol}`} className="block group">
      <Card className="h-full bg-gradient-to-br from-muted/40 to-background transition-all hover:shadow-lg hover:border-primary/60 hover:scale-[1.01] cursor-pointer px-2 py-2 sm:px-3 sm:py-3 rounded-xl border border-muted">
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          {/* Símbolo destacado */}
          <div className="mb-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-primary tracking-wide drop-shadow-sm">{item.symbol}</span>
          </div>
          {/* Valoración principal debajo del símbolo */}
          {isValuation && (
            <div className="flex items-center justify-center mb-1">
              <span className={`font-bold text-xl sm:text-2xl tabular-nums ${isUndervalued ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{typeof item.mispricingPct === 'number' ? `${Math.abs(item.mispricingPct).toFixed(1)}%` : '-'}</span>
              <span className="ml-2 text-xs sm:text-sm font-medium text-muted-foreground">{isUndervalued ? 'Infravalorada' : 'Sobrevalorada'}</span>
            </div>
          )}
          {/* Icono destacado */}
          <div className="mb-1">
            {isValuation ? (
              isUndervalued ? (
                <TrendingDown className="h-7 w-7 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingUp className="h-7 w-7 text-red-600 dark:text-red-400" />
              )
            ) : (
              <Target className="h-7 w-7 text-primary" />
            )}
          </div>
          {/* Nombre */}
          <span className="text-xs text-muted-foreground truncate max-w-[140px]" title={item.companyName}>{item.companyName}</span>
        </div>
        <CardContent className="space-y-2 pt-0">
          {/* Métricas principales en badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-background/80 border border-muted rounded px-2 py-0.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Precio
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Precio de mercado en tiempo real del activo.</p>
                </TooltipContent>
              </Tooltip>
              <span className="font-semibold tabular-nums ml-1">{fmtCurrency(item.currentPrice)}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-background/80 border border-muted rounded px-2 py-0.5 text-xs text-muted-foreground">
              {isValuation ? 'Valor Intrínseco' : 'Precio Objetivo'}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>
                    {isValuation
                      ? 'Valor calculado mediante el método de flujo de caja descontado (DCF), que estima el valor real de la empresa según sus proyecciones financieras.'
                      : 'Precio objetivo promedio estimado por analistas profesionales para los próximos 12 meses.'}
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium tabular-nums ml-1">{isValuation ? fmtCurrency(item.dcf) : fmtCurrency(item.priceTarget)}</span>
            </span>
          </div>
          {/* Métrica Principal para recomendaciones */}
          {!isValuation && (
            <div className="flex items-center gap-2 justify-center">
              <span className="inline-flex flex-col items-center px-2 py-0.5 rounded bg-green-900/20">
                <span className="font-bold text-green-600 dark:text-green-400 tabular-nums text-sm">{item.buyCount ?? 0}</span>
                <span className="text-[10px] text-muted-foreground">Compra</span>
              </span>
              <span className="inline-flex flex-col items-center px-2 py-0.5 rounded bg-yellow-900/20">
                <span className="font-bold text-yellow-600 dark:text-yellow-400 tabular-nums text-sm">{item.holdCount ?? 0}</span>
                <span className="text-[10px] text-muted-foreground">Mantener</span>
              </span>
              <span className="inline-flex flex-col items-center px-2 py-0.5 rounded bg-red-900/20">
                <span className="font-bold text-red-600 dark:text-red-400 tabular-nums text-sm">{item.sellCount ?? 0}</span>
                <span className="text-[10px] text-muted-foreground">Venta</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </NavLink>
  );
};

function fmtCurrency(n?: number) {
  if (typeof n !== 'number' || !isFinite(n)) return '-';
  return `$${n.toFixed(2)}`;
}
