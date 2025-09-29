// src/types/dashboard.ts

import { IndicatorConfig } from "../utils/financial";

// Representa cualquier dato crudo que venga de la API
export type RawApiData = Record<string, any>;

export interface AssetRating {
    rating: string;
    overallScore: number;
    returnOnEquityScore: number;
    returnOnAssetsScore: number;
    debtToEquityScore: number;
    priceToEarningsScore: number;
    priceToBookScore: number;
}

export interface RevenueSegment {
    name: string;
    value: number;
}

// Representa los datos de un activo ya procesados y listos para usar en la UI
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
    geographicRevenue: RevenueSegment[]; // <-- AÑADIR ESTA LÍNEA
    productRevenue: RevenueSegment[];    // <-- AÑADIR ESTA LÍNEA
}

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

// Define la forma del contexto del Dashboard
export interface DashboardContextType {
    selectedTickers: string[];
    assetsData: Record<string, AssetData>;
    loading: boolean;
    error: string;
    addTicker: (tickerRaw: string, options: { fromPortfolio?: boolean, addToSelected?: boolean }) => Promise<void>;
    removeTicker: (ticker: string) => void;
    indicatorConfig: IndicatorConfig;
}