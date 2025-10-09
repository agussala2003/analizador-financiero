// src/utils/financial-formulas.ts

import { RawApiData } from "../types/dashboard";
import { calculateMean, calculateStdDev } from "./math"; // Importamos desde math.ts

export const RISK_FREE_RATE = 0.02; // Tasa libre de riesgo (ej: 2%)

/**
 * Obtiene el primer valor numérico válido de un objeto buscando en una lista de campos.
 * @param obj - El objeto de datos crudos de la API.
 * @param fields - Un array de posibles nombres de campo.
 * @returns El primer número encontrado o null.
 */
export const getFirstPresent = (obj: RawApiData, fields: string[] = []): number | null => {
    for (const f of fields) {
        if (Object.prototype.hasOwnProperty.call(obj, f)) {
            const num = Number(obj[f]);
            if (num !== null && Number.isFinite(num)) return num;
        }
    }
    return null;
};

/**
 * Encuentra el precio de cierre en una fecha específica o la más cercana anterior.
 * @param historyAsc - Array de datos históricos ordenado ascendentemente por fecha.
 * @param targetDateISO - La fecha objetivo en formato ISO (YYYY-MM-DD).
 * @returns El precio de cierre o null si no se encuentra.
 */
export const findCloseByDate = (historyAsc: { date: string; close: number }[], targetDateISO: string): number | null => {
    const t = new Date(targetDateISO).getTime();
    for (let i = historyAsc.length - 1; i >= 0; i--) {
        const ti = new Date(historyAsc[i].date).getTime();
        if (ti <= t && Number.isFinite(historyAsc[i].close)) return historyAsc[i].close;
    }
    return null;
};

/**
 * Calcula la desviación estándar de los retornos y la devuelve como porcentaje.
 * @param returns - Un array de retornos diarios.
 * @returns La desviación estándar como porcentaje, o null.
 */
export const computeStdDevPct = (returns: number[]): number | null => {
    if (!Array.isArray(returns) || returns.length < 2) return null;
    const sd = calculateStdDev(returns);
    return sd * 100;
};

/**
 * Calcula el Ratio de Sharpe anualizado a partir de retornos diarios.
 * @param returns - Un array de retornos diarios.
 * @param riskFreeAnnual - La tasa libre de riesgo anual (opcional, por defecto RISK_FREE_RATE).
 * @returns El Ratio de Sharpe calculado, o null.
 */
export const computeSharpe = (returns: number[], riskFreeAnnual: number = RISK_FREE_RATE): number | null => {
    if (!Array.isArray(returns) || returns.length < 2) return null;

    const meanDailyReturn = calculateMean(returns);
    const stdDevDailyReturn = calculateStdDev(returns);

    if (stdDevDailyReturn === 0) return null;

    const meanAnnualReturn = meanDailyReturn * 252;
    const stdDevAnnualReturn = stdDevDailyReturn * Math.sqrt(252);

    return (stdDevAnnualReturn > 0) ? (meanAnnualReturn - riskFreeAnnual) / stdDevAnnualReturn : null;
};