// src/utils/financial-formulas.ts

import { calculateMean, calculateStdDev } from "./math";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawApiData = any;

// Tasa libre de riesgo actual (Bonos Tesoro USA ~4.25%)
// Un valor más alto hace que el Sharpe sea más bajo (o negativo si el activo rinde menos que esto).
export const RISK_FREE_RATE = 0.0425;

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
 * Encuentra el precio de cierre en una fecha específica o la anterior más cercana.
 * Asume que historyAsc está ordenado ASCENDENTEMENTE.
 */
export const findCloseByDate = (historyAsc: { date: string; close: number }[], targetDateISO: string): number | null => {
    if (!historyAsc || historyAsc.length === 0) return null;

    // Usamos split para quedarnos solo con YYYY-MM-DD y evitar líos de horas
    const target = targetDateISO.split('T')[0];

    // Buscamos desde el final (fechas recientes) hacia atrás
    for (let i = historyAsc.length - 1; i >= 0; i--) {
        const currentDate = historyAsc[i].date.split('T')[0];

        // Si encontramos una fecha que es igual o anterior al target, esa es nuestra fecha.
        if (currentDate <= target && Number.isFinite(historyAsc[i].close)) {
            return historyAsc[i].close;
        }
    }
    return null;
};

export const computeStdDevPct = (returns: number[]): number | null => {
    if (!Array.isArray(returns) || returns.length < 2) return null;
    const sd = calculateStdDev(returns);
    return sd * 100;
};

export const computeSharpe = (returns: number[], riskFreeAnnual: number = RISK_FREE_RATE): number | null => {
    if (!Array.isArray(returns) || returns.length < 5) return null;

    const meanDailyReturn = calculateMean(returns);
    const stdDevDailyReturn = calculateStdDev(returns);

    if (stdDevDailyReturn < 0.000001) return null;

    const meanAnnualReturn = meanDailyReturn * 252;
    const stdDevAnnualReturn = stdDevDailyReturn * Math.sqrt(252);

    return (meanAnnualReturn - riskFreeAnnual) / stdDevAnnualReturn;
};