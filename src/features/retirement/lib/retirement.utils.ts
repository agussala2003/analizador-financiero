// src/features/retirement/lib/retirement.utils.ts

import { ChartDatum, RetirementParams, RetirementResults } from "../types/retirement.types";

/**
 * Formatea un valor numérico como moneda con notación compacta
 * Maneja valores extremadamente altos (billones, trillones) y valores en 0
 */
export function formatCurrency(value: number): string {
  // Manejar valores especiales
  if (value === 0) return "$0";
  if (!isFinite(value)) return "$∞";
  if (isNaN(value)) return "$0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  // Valores extremadamente altos (notación científica)
  if (absValue >= 1e15) {
    const exponent = Math.floor(Math.log10(absValue));
    const mantissa = (absValue / Math.pow(10, exponent)).toFixed(1);
    return `${sign}$${mantissa}e${exponent}`;
  }
  
  // Trillones (1,000,000,000,000+)
  if (absValue >= 1_000_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000_000).toFixed(2)}T`;
  }
  
  // Billones (1,000,000,000+)
  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  }
  
  // Millones (1,000,000+)
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  }
  
  // Miles (1,000+)
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(1)}k`;
  }
  
  // Valores menores a 1,000
  return `${sign}$${absValue.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Calcula el valor futuro de la inversión inicial con interés compuesto
 */
export function calculateFutureValueInitial(
  initialInvestment: number,
  annualReturn: number,
  years: number
): number {
  return initialInvestment * Math.pow(1 + annualReturn / 100, years);
}

/**
 * Calcula el valor futuro de las contribuciones mensuales
 */
export function calculateFutureValueContributions(
  monthlyContribution: number,
  annualReturn: number,
  years: number
): number {
  const monthlyRate = annualReturn / 100 / 12;

  if (monthlyRate > 0) {
    return (
      (monthlyContribution * (Math.pow(1 + monthlyRate, years * 12) - 1)) /
      monthlyRate
    );
  }
  // Sin interés, solo suma de contribuciones
  return monthlyContribution * 12 * years;
}

/**
 * Calcula el total ahorrado sin inversión (solo suma)
 */
export function calculateSavingsOnly(
  initialInvestment: number,
  monthlyContribution: number,
  years: number
): number {
  return initialInvestment + monthlyContribution * 12 * years;
}

/**
 * Genera los datos del gráfico año por año
 */
export function generateChartData(params: RetirementParams): ChartDatum[] {
  const { initialInvestment, monthlyContribution, years, annualReturn } = params;
  const data: ChartDatum[] = [];
  const monthlyRate = annualReturn / 100 / 12;

  for (let year = 1; year <= years; year++) {
    // Solo ahorro (sin interés)
    const savedTotal = initialInvestment + monthlyContribution * 12 * year;

    // Valor futuro de la inversión inicial
    const futureValueInitial = calculateFutureValueInitial(
      initialInvestment,
      annualReturn,
      year
    );

    // Valor futuro de las contribuciones mensuales
    let contributionFV = 0;
    if (monthlyRate > 0) {
      contributionFV =
        (monthlyContribution * (Math.pow(1 + monthlyRate, year * 12) - 1)) /
        monthlyRate;
    } else {
      contributionFV = monthlyContribution * 12 * year;
    }

    const investedTotal = futureValueInitial + contributionFV;

    data.push({
      year: `Año ${year}`,
      "Solo Ahorro": savedTotal,
      Invirtiendo: investedTotal,
    });
  }

  return data;
}

/**
 * Calcula los resultados finales de la proyección
 */
export function calculateResults(chartData: ChartDatum[]): RetirementResults {
  if (chartData.length === 0) {
    return {
      finalAhorro: 0,
      finalInversion: 0,
      diferencia: 0,
      porcentajeMejor: 0,
    };
  }

  const lastData = chartData[chartData.length - 1];
  const finalAhorro = lastData["Solo Ahorro"];
  const finalInversion = lastData.Invirtiendo;
  const diferencia = finalInversion - finalAhorro;
  
  // Cálculo corregido: retorno porcentual real vs ahorro
  const porcentajeMejor =
    finalAhorro > 0 ? (diferencia / finalAhorro) * 100 : 0;

  return {
    finalAhorro,
    finalInversion,
    diferencia,
    porcentajeMejor,
  };
}

/**
 * Valida que un parámetro esté dentro de un rango
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calcula la tasa de crecimiento anual compuesta (CAGR)
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue === 0 || years === 0) return 0;
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

/**
 * Calcula el total aportado (inversión inicial + contribuciones)
 */
export function calculateTotalContributed(
  initialInvestment: number,
  monthlyContribution: number,
  years: number
): number {
  return initialInvestment + monthlyContribution * 12 * years;
}

/**
 * Calcula las ganancias por interés compuesto
 */
export function calculateCompoundGains(
  finalInversion: number,
  totalContributed: number
): number {
  return finalInversion - totalContributed;
}
