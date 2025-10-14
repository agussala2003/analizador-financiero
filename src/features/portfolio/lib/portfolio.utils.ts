// src/features/portfolio/lib/portfolio.utils.ts

import { Holding, PortfolioAssetData } from "../../../types/portfolio";
import { AllocationDatum, PlDatum, ChartConfigFixed, PortfolioMetrics } from "../types/portfolio.types";

/**
 * Formatea un valor numérico como moneda
 */
export const formatCurrency = (value: number): string =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Formatea un valor numérico como porcentaje
 */
export const formatPercent = (value: number): string =>
  `${Number(value || 0).toFixed(2)}%`;

/**
 * Formatea una cantidad numérica con precisión
 */
export const formatQuantity = (value: number): string =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

/**
 * Formatea una fecha en formato español
 */
export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * Formatea un número con precisión o retorna 'N/A'
 */
export const formatNumber = (value: number | string): string =>
  typeof value === "number" && isFinite(value) ? value.toFixed(2) : "N/A";

/**
 * Calcula las métricas del portfolio
 */
export function calculatePortfolioMetrics(
  holdings: Holding[],
  portfolioData: Record<string, PortfolioAssetData>
): PortfolioMetrics {
  const initialStats: PortfolioMetrics = {
    totalInvested: 0,
    currentValue: 0,
    currentPL: 0,
    currentPLPercent: 0,
    dailyPL: 0,
    bestPerformer: { symbol: "N/A", plPercent: 0 },
    worstPerformer: { symbol: "N/A", plPercent: 0 },
    positionsCount: 0,
    portfolioBeta: "N/A",
    sharpeRatio: "N/A",
    avgHoldingDays: 0,
  };

  if (!holdings || holdings.length === 0) return initialStats;

  let totalInvested = 0;
  let currentValue = 0;
  let dailyPL = 0;
  let weightedBetaSum = 0;
  let weightedSharpeSum = 0;

  const performers = holdings.map((holding) => {
    const assetData: PortfolioAssetData | undefined = portfolioData[holding.symbol];
    const currentPrice = assetData?.currentPrice ?? 0;
    const dayChange = assetData?.dayChange ?? 0;

    const marketValue = holding.quantity * currentPrice;
    const pl = marketValue - holding.totalCost;
    const plPercent = holding.totalCost > 0 ? (pl / holding.totalCost) * 100 : 0;

    if (isFinite(currentPrice) && isFinite(dayChange)) {
      const previousDayPrice = currentPrice / (1 + dayChange / 100);
      dailyPL += holding.quantity * (currentPrice - previousDayPrice);
    }

    totalInvested += holding.totalCost;
    currentValue += marketValue;

    if (typeof assetData?.beta === "number") weightedBetaSum += assetData.beta * marketValue;
    if (typeof assetData?.sharpeRatio === "number")
      weightedSharpeSum += assetData.sharpeRatio * marketValue;

    return { symbol: holding.symbol, plPercent };
  });

  const currentPL = currentValue - totalInvested;
  const currentPLPercent = totalInvested > 0 ? (currentPL / totalInvested) * 100 : 0;

  performers.sort((a, b) => b.plPercent - a.plPercent);

  return {
    totalInvested,
    currentValue,
    currentPL,
    currentPLPercent,
    dailyPL,
    bestPerformer: performers[0] || initialStats.bestPerformer,
    worstPerformer: performers[performers.length - 1] || initialStats.worstPerformer,
    positionsCount: holdings.length,
    portfolioBeta: currentValue > 0 ? weightedBetaSum / currentValue : "N/A",
    sharpeRatio: currentValue > 0 ? weightedSharpeSum / currentValue : "N/A",
    avgHoldingDays: 0, // This will be calculated separately in portfolio-page.tsx
  };
}

/**
 * Procesa los holdings para generar datos de alocación
 */
export function calculateAllocationData(holdings: Holding[]): {
  allocationData: AllocationDatum[];
  totalValue: number;
} {
  if (!holdings || holdings.length === 0) {
    return { allocationData: [], totalValue: 0 };
  }

  const totalValue = holdings.reduce(
    (acc, h) => acc + h.quantity * (h.assetData.currentPrice ?? 0),
    0
  );

  const allocationData: AllocationDatum[] = holdings.map((h) => {
    const value = h.quantity * (h.assetData.currentPrice ?? 0);
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return {
      name: h.symbol,
      value,
      percentage,
    };
  });

  return { allocationData, totalValue };
}

/**
 * Calcula los datos de P&L por activo
 */
export function calculatePlData(holdings: Holding[]): PlDatum[] {
  if (!holdings || holdings.length === 0) return [];

  return holdings.map((h) => {
    const marketValue = h.quantity * (h.assetData.currentPrice ?? 0);
    const plValue = marketValue - h.totalCost;
    const plPercent = h.totalCost > 0 ? ((marketValue - h.totalCost) / h.totalCost) * 100 : 0;
    return {
      symbol: h.symbol,
      pl: plPercent,
      plValue: plValue,
    };
  });
}

/**
 * Genera la configuración de colores para los gráficos
 */
export function generateChartConfig(allocationData: AllocationDatum[]): ChartConfigFixed {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  const chartConfig: ChartConfigFixed = {};
  allocationData.forEach((item, index) => {
    chartConfig[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
  });

  return chartConfig;
}

/**
 * Calcula el P&L diario en porcentaje
 */
export function calculateDailyPlPercent(currentValue: number, dailyPL: number): number {
  return currentValue > 0 ? (dailyPL / (currentValue - dailyPL)) * 100 : 0;
}

/**
 * Determina la clase de color según el valor (positivo o negativo)
 */
export function getColorClass(value: number): string {
  return value >= 0 ? "text-green-500" : "text-red-500";
}

/**
 * Valida si una fecha es futura
 */
export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

/**
 * Calcula la cantidad final en acciones considerando CEDEARs
 */
export function calculateFinalQuantity(
  enteredQuantity: number,
  isCedears: boolean,
  ratio: number | null | undefined
): number {
  return isCedears && ratio ? enteredQuantity / ratio : enteredQuantity;
}

/**
 * Calcula el precio final por acción considerando CEDEARs
 */
export function calculateFinalPrice(
  enteredPrice: number,
  isCedears: boolean,
  ratio: number | null | undefined
): number {
  return isCedears && ratio ? enteredPrice * ratio : enteredPrice;
}
