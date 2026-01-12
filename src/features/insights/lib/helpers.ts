import type { AssetData } from "../../../types/dashboard";
import type { InsightItem } from "../types/insights.types";

/**
 * Funci\u00f3n de sanidad para validar si un DCF es razonable comparado con el precio.
 * Descarta valores que difieran m\u00e1s de 50x del precio actual.
 */
function isSaneDCF(dcfValue: number, currentPrice: number): boolean {
  if (currentPrice === 0) return true;
  const ratio = dcfValue / currentPrice;
  return ratio > 0.02 && ratio < 50; // Entre 2% y 5000%
}

/**
 * Extrae el valor intr\u00ednseco (DCF) usando selecci\u00f3n inteligente con sanity checks.
 * Prioriza DCF Levered si es razonable, sino usa DCF Hist\u00f3rico.
 */
function extractIntrinsicValue(asset: AssetData): number | undefined {
  const currentPrice = asset.quote?.price ?? 0;
  if (currentPrice === 0) return undefined;

  // Candidato A: Levered
  let leveredVal: number | null = null;
  const levered = asset.dcfLevered as unknown;
  if (levered && typeof levered === 'object') {
    const lev = levered as Record<string, unknown>;
    if (typeof lev.equityValuePerShare === 'number') leveredVal = lev.equityValuePerShare;
    else if (typeof lev.dcf === 'number') leveredVal = lev.dcf;
  }

  // Candidato B: Hist\u00f3rico
  let historicalVal: number | null = null;
  if (asset.dcf && Array.isArray(asset.dcf) && asset.dcf.length > 0) {
    const sortedDcf = [...asset.dcf].sort((a, b) => {
      const dateA = new Date((a as unknown as Record<string, unknown>).date as string || (a as unknown as Record<string, unknown>).year as string).getTime();
      const dateB = new Date((b as unknown as Record<string, unknown>).date as string || (b as unknown as Record<string, unknown>).year as string).getTime();
      return dateB - dateA;
    });
    const latest = sortedDcf[0] as unknown as Record<string, unknown>;
    const raw = latest.dcf ?? latest['Stock Price'] ?? latest.stockPrice ?? latest.equityValuePerShare;
    if (typeof raw === 'number' || (typeof raw === 'string' && !isNaN(parseFloat(raw)))) {
      historicalVal = typeof raw === 'number' ? raw : parseFloat(raw);
    }
  }

  // Selecci\u00f3n con sanity checks
  const isLeveredSane = leveredVal !== null && isSaneDCF(leveredVal, currentPrice);
  const isHistoricalSane = historicalVal !== null && isSaneDCF(historicalVal, currentPrice);

  if (isLeveredSane) return leveredVal!;
  if (isHistoricalSane) return historicalVal!;
  
  // Si ninguno pasa el sanity check, no incluimos el activo
  return undefined;
}

/**
 * Construye un InsightItem a partir de AssetData.
 * Usa la misma l\u00f3gica de c\u00e1lculo de DCF que asset-detail.
 */
export function toInsightItem(a: AssetData): InsightItem | undefined {
  const price = a.quote?.price ?? 0;
  if (price === 0) return undefined;

  const dcf = extractIntrinsicValue(a);
  
  // Si no hay DCF v\u00e1lido, no incluimos para valoraci\u00f3n
  if (!dcf) return undefined;

  const target = a.priceTargetConsensus?.targetConsensus ?? undefined;

  // Mispricing con denominador PRECIO para coincidir con el detalle del activo
  // Positivo: infravalorada (dcf > precio). Negativo: sobrevalorada (precio > dcf).
  const mispricingPct = dcf && price > 0 ? ((dcf - price) / price) * 100 : undefined;
  
  // Si el mispricing es mayor a 5000% (anomal\u00eda), descartamos
  if (mispricingPct !== undefined && Math.abs(mispricingPct) > 5000) {
    return undefined;
  }

  const targetUpsidePct = target && price > 0 ? ((target - price) / price) * 100 : undefined;

  return {
    symbol: a.profile?.symbol ?? a.quote?.symbol ?? 'N/A',
    companyName: a.profile?.companyName ?? a.quote?.name ?? 'N/A',
    currentPrice: price,
    dcf,
    priceTarget: target,
    mispricingPct,
    targetUpsidePct,
  };
}

/**
 * Ordena por infravaloración (mispricingPct descendente).
 */
export function sortUndervalued(items: InsightItem[]): InsightItem[] {
  return items
    .filter(i => typeof i.mispricingPct === 'number' && i.mispricingPct > 0)
    .sort((a, b) => (b.mispricingPct! - a.mispricingPct!));
}

/**
 * Ordena por sobrevaloración (mispricingPct ascendente, valores negativos).
 */
export function sortOvervalued(items: InsightItem[]): InsightItem[] {
  return items
    .filter(i => typeof i.mispricingPct === 'number' && i.mispricingPct < 0)
    .sort((a, b) => (a.mispricingPct! - b.mispricingPct!));
}
