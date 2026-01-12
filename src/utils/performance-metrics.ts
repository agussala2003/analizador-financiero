// src/utils/performance-metrics.ts

import { AssetHistorical } from '../types/dashboard';

export interface PerformanceMetrics {
  bestYear: { year: number; return: number } | null;
  worstYear: { year: number; return: number } | null;
  maxDrawdown: number;
}

/**
 * Calculates Best Year, Worst Year and Max Drawdown from historical data.
 * Assumes historicalData is sorted by date ascending (oldest to newest).
 */
export function calculatePerformanceMetrics(historicalData: AssetHistorical[]): PerformanceMetrics {
  // Validación básica
  if (!historicalData || !Array.isArray(historicalData) || historicalData.length < 2) {
    return { bestYear: null, worstYear: null, maxDrawdown: 0 };
  }

  // 1. Calculate Max Drawdown
  // Drawdown es la caída porcentual desde el "pico" más alto anterior hasta el punto actual.
  let maxDrawdown = 0;
  let peak = -Infinity;

  for (const day of historicalData) {
    // Solo consideramos precios válidos
    if (day.close > 0) {
      if (day.close > peak) {
        peak = day.close;
      }
      // Drawdown es siempre negativo o cero.
      // Ejemplo: Pico 100, Precio Actual 80 -> (80 - 100) / 100 = -0.20 (-20%)
      const drawdown = (day.close - peak) / peak;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  // 2. Calculate Annual Returns
  // Agrupamos por año para calcular el rendimiento de cada uno.
  const byYear = new Map<number, { firstClose: number; lastClose: number }>();

  for (const day of historicalData) {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const price = day.close;

    if (price > 0) {
      if (!byYear.has(year)) {
        byYear.set(year, { firstClose: price, lastClose: price });
      } else {
        const current = byYear.get(year)!;
        // Mantenemos el primer precio registrado del año y actualizamos el último
        current.lastClose = price;
      }
    }
  }

  const years = Array.from(byYear.keys()).sort((a, b) => a - b);
  const annualReturns: { year: number; return: number }[] = [];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const data = byYear.get(year)!;
    let basePrice = data.firstClose;

    // Lógica estándar de retorno anual:
    // El retorno de 2024 se basa en el cierre de 2023.
    // Si no tenemos el año anterior (es el primer año de datos), usamos el primer precio de ESE año.
    if (i > 0) {
      const prevYear = years[i - 1];
      basePrice = byYear.get(prevYear)!.lastClose;
    }

    if (basePrice > 0) {
      const yearReturn = (data.lastClose - basePrice) / basePrice;
      annualReturns.push({ year, return: yearReturn });
    }
  }

  // 3. Find Best/Worst
  let bestYear: { year: number; return: number } | null = null;
  let worstYear: { year: number; return: number } | null = null;

  for (const item of annualReturns) {
    if (!bestYear || item.return > bestYear.return) {
      bestYear = item;
    }
    if (!worstYear || item.return < worstYear.return) {
      worstYear = item;
    }
  }

  return { bestYear, worstYear, maxDrawdown };
}