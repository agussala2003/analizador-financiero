// src/features/insights/types/insights.types.ts

import type { AssetData } from "../../../types/dashboard";

/**
 * Item base para ranking de insights.
 */
export interface InsightItem {
  symbol: string;
  companyName: string;
  currentPrice: number;
  dcf?: number;
  priceTarget?: number;
  // Para listas de analistas basadas en gradesConsensus
  buyCount?: number;
  holdCount?: number;
  sellCount?: number;
  strongBuyCount?: number;
  strongSellCount?: number;
  consensus?: string;
  buyRatio?: number; // 0..1
  sellRatio?: number; // 0..1
  mispricingPct?: number; // (dcf - price)/price * 100
  targetUpsidePct?: number; // (priceTarget - price)/price * 100
}

/**
 * Conjunto de listas para la página de Insights.
 */
export interface InsightsData {
  undervalued: InsightItem[];
  overvalued: InsightItem[];
  analystBuys: InsightItem[];
  analystSells: InsightItem[];
}

export interface AssetDataCacheRow {
  symbol: string;
  data: AssetData;
  last_updated_at: string;
}
