// src/utils/math.ts

/**
 * Calcula la media (promedio) de un array de números.
 */
const calculateMean = (data: number[]): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
};

/**
 * Calcula la desviación estándar de una muestra de números.
 */
const calculateStdDev = (data: number[]): number => {
    if (!data || data.length < 2) return 0;
    const mean = calculateMean(data);
    const variance = data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (data.length - 1);
    return Math.sqrt(variance);
};

/**
 * Calcula la covarianza entre dos arrays de retornos.
 */
const calculateCovariance = (returns1: number[], returns2: number[]): number => {
    const n = Math.min(returns1.length, returns2.length);
    if (n < 2) return 0;

    const mean1 = calculateMean(returns1);
    const mean2 = calculateMean(returns2);
    let covariance = 0;

    for (let i = 0; i < n; i++) {
        covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
    }
    return covariance / (n - 1);
};

/**
 * Calcula el coeficiente de correlación entre dos arrays de retornos.
 */
export const correlation = (returns1: number[], returns2: number[]): number => {
    const cov = calculateCovariance(returns1, returns2);
    const stdDev1 = calculateStdDev(returns1);
    const stdDev2 = calculateStdDev(returns2);

    if (stdDev1 === 0 || stdDev2 === 0) return 0;
    return cov / (stdDev1 * stdDev2);
};

// Exportamos las funciones básicas para que puedan ser usadas en otros módulos.
export { calculateMean, calculateStdDev };