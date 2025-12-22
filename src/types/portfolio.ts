// src/types/portfolio.ts

/**
 * Representa una única transacción de compra o venta.
 */
export interface Transaction {
    id: number;
    user_id: string;
    portfolio_id: number; // Linked to portfolios table
    symbol: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string; // Fecha en formato ISO string
    transaction_type: 'buy' | 'sell';
}

/**
 * Representa un portafolio de inversión.
 */
export interface Portfolio {
    id: number;
    user_id: string;
    name: string;
    created_at: string;
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
    holdingDays: number; // Días desde la primera compra
};

/**
 * Define la estructura del contexto del Portafolio.
 */
export interface PortfolioContextType {
    // State
    portfolios: Portfolio[];
    currentPortfolio: Portfolio | null;
    transactions: Transaction[];
    holdings: Holding[];
    totalPerformance: {
        pl: number;
        percent: number;
    };
    portfolioData: Record<string, PortfolioAssetData>;
    loading: boolean;
    error: string | null;

    // Actions
    selectPortfolio: (portfolioId: number) => void;
    createPortfolio: (name: string) => Promise<Portfolio>;
    deletePortfolio: (portfolioId: number) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<Transaction[] | null>;
    deleteAsset: (symbol: string) => Promise<void>;
    refreshPortfolio: () => Promise<void>;
}