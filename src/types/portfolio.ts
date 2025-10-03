// src/types/portfolio.ts

export interface Transaction {
    id: number;
    user_id: string;
    symbol: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string; // Las fechas de Supabase suelen venir como strings ISO
    transaction_type: 'buy' | 'sell';
}

// Define la forma de los datos de un activo en el portafolio.
// Es un subconjunto de AssetData, solo con lo necesario para el portafolio.
export interface PortfolioAssetData {
    currentPrice?: number;
    // Puedes añadir más campos de AssetData si los necesitas aquí
}

// Define la forma de un activo consolidado (holding) en el portafolio.
export interface Holding {
    symbol: string;
    quantity: number;
    totalCost: number;
    avgPurchasePrice: number;
    assetData: PortfolioAssetData;
}

// Define el valor que el contexto del portafolio proveerá.
export interface PortfolioContextType {
    transactions: Transaction[];
    holdings: Holding[];
    totalPerformance: {
        pl: number;
        percent: number;
    };
    portfolioData: Record<string, PortfolioAssetData>;
    loading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<Transaction[] | null>;
    deleteAsset: (symbol: string) => Promise<void>;
    refreshPortfolio: () => Promise<void>;
}

export type HoldingWithMetrics = Holding & {
  currentPrice: number;
  marketValue: number;
  pl: number;
  plPercent: number;
};