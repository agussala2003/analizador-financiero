// src/types/portfolio.ts

/**
 * Representa una única transacción de compra o venta.
 */
export interface Transaction {
    id: number;
    user_id: string;
    symbol: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string; // Fecha en formato ISO string
    transaction_type: 'buy' | 'sell';
}

/**
 * Datos de mercado relevantes para un activo dentro del portafolio.
 * Es un subconjunto de `AssetData` para optimizar las cargas.
 */
export interface PortfolioAssetData {
    currentPrice?: number;
    dayChange?: number;
    beta?: number;
    sharpeRatio?: number;
}

/**
 * Representa una posición consolidada (tenencia) de un activo en el portafolio.
 */
export interface Holding {
    symbol: string;
    quantity: number;
    totalCost: number;
    avgPurchasePrice: number;
    assetData: PortfolioAssetData;
}

/**
 * Extiende `Holding` con métricas calculadas para la UI.
 */
export type HoldingWithMetrics = Holding & {
  currentPrice: number;
  marketValue: number;
  pl: number;
  plPercent: number;
};

/**
 * Define la estructura del contexto del Portafolio.
 */
export interface PortfolioContextType {
    transactions: Transaction[];
    holdings: Holding[];
    totalPerformance: {
        pl: number;
        percent: number;
    };
    portfolioData: Record<string, PortfolioAssetData>;
    loading: boolean;
    // ✅ Mejora: exponer estado de error explícito
    error: string | null;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<Transaction[] | null>;
    deleteAsset: (symbol: string) => Promise<void>;
    refreshPortfolio: () => Promise<void>;
}