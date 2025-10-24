/**
 * Ordena por infravaloración (mispricingPct descendente).
 */
export function sortUndervalued(items: InsightItem[]): InsightItem[] {
  return items
    .filter(i => typeof i.mispricingPct === 'number')
    .sort((a, b) => (b.mispricingPct! - a.mispricingPct!));
}

/**
 * Ordena por sobrevaloración (mispricingPct ascendente).
 */
export function sortOvervalued(items: InsightItem[]): InsightItem[] {
  return items
    .filter(i => typeof i.mispricingPct === 'number')
    .sort((a, b) => (a.mispricingPct! - b.mispricingPct!));
}

/**
 * Filtra y ordena activos con ROIC > 20% y PER < 17.
 */

export const MIN_ROIC_THRESHOLD = 10; // Ejemplo: ROIC mayor al 10%
export const MAX_PE_THRESHOLD = 30;   // Ejemplo: PER menor a 30 (y mayor que 0)

export function filterAndSortHighRoicLowPe(items: InsightItem[]): InsightItem[] {

  const filteredItems = items.filter(i => {
    const meetsRoic = i.roic! > MIN_ROIC_THRESHOLD;
    const meetsPe = i.pe! < MAX_PE_THRESHOLD;

    return meetsRoic && meetsPe;
  });

  // Ordena los activos filtrados por ROIC de mayor a menor
  return filteredItems.sort((a, b) => (b.roic ?? -Infinity) - (a.roic ?? -Infinity));
}
import type { AssetData } from "../../../types/dashboard";
import type { InsightItem } from "../types/insights.types";

/**
 * Construye un InsightItem a partir de AssetData.
 */
export function toInsightItem(a: AssetData): InsightItem {
  const price = a.currentPrice || 0;
  const dcf = typeof a.dcf === 'number' ? a.dcf : undefined;
  const target = a.lastMonthAvgPriceTarget || undefined;
  const analystScore = a.rating?.overallScore ?? undefined;
  // ROIC and PE extraction (from AssetData.data or direct fields)
  const roic = typeof a.data?.roic === 'number' ? a.data.roic : undefined;
  const pe = typeof a.data?.PER === 'number' ? a.data.PER : undefined;

  // Mispricing con denominador PRECIO para coincidir con el detalle del activo (estilo Investing)
  // Positivo: infravalorada (dcf > precio). Negativo: sobrevalorada (precio > dcf).
  const mispricingPct = dcf && price > 0 ? ((dcf - price) / price) * 100 : undefined;
  const targetUpsidePct = target && price > 0 ? ((target - price) / price) * 100 : undefined;

  return {
    symbol: a.symbol,
    companyName: a.companyName,
    currentPrice: price,
    dcf,
    priceTarget: target,
    analystScore,
    mispricingPct,
    targetUpsidePct,
    roic,
    pe,
  };
}
