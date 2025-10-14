// src/features/portfolio/types/portfolio.types.ts

import { HoldingWithMetrics } from "../../../types/portfolio";

/**
 * Props para AddTransactionModal
 */
export interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string | null;
  currentPrice: number | null;
}

/**
 * Props para SellTransactionModal
 */
export interface SellTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: HoldingWithMetrics | null;
}

/**
 * Info del modal de agregar transacción
 */
export interface AddModalInfo {
  isOpen: boolean;
  ticker: string | null;
  price: number | null;
}

/**
 * Props para PortfolioView
 */
export interface PortfolioViewProps {
  holdings: HoldingWithMetrics[];
  onDeleteAsset: (symbol: string) => void;
  onAddMore: (ticker: string, price: number) => void;
  onSell: (holding: HoldingWithMetrics) => void;
}

/**
 * Datos de alocación para el gráfico de torta
 */
export interface AllocationDatum {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

/**
 * Datos de P&L para el gráfico de barras
 */
export interface PlDatum {
  symbol: string;
  pl: number;
  plValue: number;
}

/**
 * Configuración de colores para los gráficos
 */
export type ChartConfigFixed = Record<
  string,
  { label?: React.ReactNode; color?: string; icon?: React.ComponentType }
>;

/**
 * Métricas calculadas del portfolio
 */
export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  currentPL: number;
  currentPLPercent: number;
  dailyPL: number;
  bestPerformer: { symbol: string; plPercent: number };
  worstPerformer: { symbol: string; plPercent: number };
  positionsCount: number;
  portfolioBeta: number | "N/A";
  sharpeRatio: number | "N/A";
  avgHoldingDays: number;
}
