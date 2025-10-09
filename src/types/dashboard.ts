// src/types/dashboard.ts

import { IndicatorConfig } from "../utils/financial";

/**
 * Representa cualquier objeto de datos crudos recibido de la API de FMP.
 */
export type RawApiData = Record<string, string | number | null>;

/**
 * Calificación de un activo (rating).
 */
export interface AssetRating {
    rating: string;
    overallScore: number;
    returnOnEquityScore: number;
    returnOnAssetsScore: number;
    debtToEquityScore: number;
    priceToEarningsScore: number;
    priceToBookScore: number;
}

/**
 * Representa un segmento de ingresos (por geografía o producto).
 */
export interface RevenueSegment {
    name: string;
    value: number;
}

/**
 * Datos históricos de un activo para un día específico.
 */
export interface HistoricalHolding {
    symbol: string;
    date: string; // ISO date string
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    vwap: number;
}

/**
 * Representa la estructura completa y procesada de un activo financiero, lista para usar en la UI.
 */
export interface AssetData {
    symbol: string;
    companyName: string;
    currency: string;
    exchangeFullName: string;
    industry: string;
    website: string;
    description: string;
    ceo: string;
    sector: string;
    country: string;
    employees: number | string;
    image: string;
    marketCap: number;
    lastDividend: number;
    averageVolume: number;
    lastMonthAvgPriceTarget: number;
    range: string;
    volume: number;
    beta: number;
    data: Record<string, number | 'N/A'>; // Indicadores procesados
    historicalReturns: number[];
    historicalRaw: HistoricalHolding[];
    currentPrice: number;
    dayChange: number;
    weekChange: number | 'N/A';
    monthChange: number | 'N/A';
    quarterChange: number | 'N/A';
    yearChange: number | 'N/A';
    ytdChange: number | 'N/A';
    stdDev: number | 'N/A';
    sharpeRatio: number | 'N/A';
    dcf: number | 'N/A';
    rating: AssetRating | null;
    geographicRevenue: RevenueSegment[];
    productRevenue: RevenueSegment[];
}

/**
 * Define la estructura del contexto del Dashboard.
 */
export interface DashboardContextType {
    selectedTickers: string[];
    assetsData: Record<string, AssetData>;
    loading: boolean;
    error: string;
    addTicker: (tickerRaw: string, options: { fromPortfolio?: boolean, addToSelected?: boolean }) => Promise<void>;
    removeTicker: (ticker: string) => void;
    indicatorConfig: IndicatorConfig;
}