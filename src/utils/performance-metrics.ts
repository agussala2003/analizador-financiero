
import { HistoricalHolding } from '../types/dashboard';

export interface PerformanceMetrics {
  bestYear: { year: number; return: number } | null;
  worstYear: { year: number; return: number } | null;
  maxDrawdown: number;
}

/**
 * Calculates Best Year, Worst Year and Max Drawdown from historical data.
 * Assumes historicalData is sorted by date ascending.
 */
export function calculatePerformanceMetrics(historicalData: HistoricalHolding[]): PerformanceMetrics {
  if (!historicalData || historicalData.length < 2) {
    return { bestYear: null, worstYear: null, maxDrawdown: 0 };
  }

  // 1. Calculate Max Drawdown
  let maxDrawdown = 0;
  let peak = historicalData[0].close;

  for (const day of historicalData) {
    if (day.close > peak) {
      peak = day.close;
    }
    const drawdown = (day.close - peak) / peak;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // 2. Calculate Annual Returns
  // Group by year
  const byYear = new Map<number, { open: number; close: number; openDate: string; closeDate: string }>();

  for (const day of historicalData) {
    const year = new Date(day.date).getFullYear();
    if (!byYear.has(year)) {
      byYear.set(year, { 
        open: day.close, // Using first available close as approximate open if open not available or simplifying
        close: day.close,
        openDate: day.date,
        closeDate: day.date 
      });
    } else {
      const current = byYear.get(year)!;
      current.close = day.close;
      current.closeDate = day.date;
      // If we have a genuine open price for the first day, we could use day.open,
      // but usually annual return is calculated from Prev Year Close. 
      // For the first year in dataset, we use First Day Close (or Open).
    }
  }

  // Refine calculation: Return = (Close_Year_N / Close_Year_N-1) - 1
  // For the very first year, Return = (Close_Year / Open_Year) - 1
  const years = Array.from(byYear.keys()).sort((a, b) => a - b);
  const annualReturns: { year: number; return: number }[] = [];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const data = byYear.get(year)!;
    
    let basePrice = data.open;
    
    // If there is a previous year, use its close as the base for this year's return
    if (i > 0) {
      const prevYear = years[i - 1];
      basePrice = byYear.get(prevYear)!.close;
    }

    if (basePrice > 0) {
      const yearReturn = (data.close - basePrice) / basePrice;
      annualReturns.push({ year, return: yearReturn });
    }
  }

  // 3. Find Best/Worst
  let bestYear: { year: number; return: number } | null = null;
  let worstYear: { year: number; return: number } | null = null;

  if (annualReturns.length > 0) {
    // Sort by return
    annualReturns.sort((a, b) => b.return - a.return); // Descending
    bestYear = annualReturns[0];
    worstYear = annualReturns[annualReturns.length - 1];
  }

  return {
    bestYear,
    worstYear,
    maxDrawdown, // Return as negative number e.g. -0.45
  };
}
