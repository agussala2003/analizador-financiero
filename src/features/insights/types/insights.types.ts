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
  analystScore?: number; // rating.overallScore o puntaje agregado
  // Para listas de analistas basadas en calificaciones
  buyCount?: number;
  holdCount?: number;
  sellCount?: number;
  buyRatio?: number; // 0..1
  sellRatio?: number; // 0..1
  mispricingPct?: number; // (dcf - price)/dcf * 100
  targetUpsidePct?: number; // (priceTarget - price)/price * 100
  roic?: number; // Return on Invested Capital (%)
  pe?: number; // Price to Earnings
}

/**
 * Conjunto de listas para la página de Insights.
 */
export interface InsightsData {
  undervalued: InsightItem[];
  overvalued: InsightItem[];
  highRoicLowPe: InsightItem[];
  analystBuys: InsightItem[];
  analystSells: InsightItem[];
  analystFirms?: {
    topBuyers: AnalystFirmStat[];
    topSellers: AnalystFirmStat[];
  };
}

export interface AssetDataCacheRow {
  symbol: string;
  data: AssetData;
  last_updated_at: string;
}

export interface AnalystFirmStat {
  firm: string;
  buy: number;
  hold: number;
  sell: number;
  total: number;
  buyRatio: number; // buy / total
  sellRatio: number; // sell / total
}
