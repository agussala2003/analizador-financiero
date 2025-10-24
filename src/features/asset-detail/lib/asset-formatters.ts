// src/features/asset-detail/lib/asset-formatters.ts

/**
 * Formatea números grandes usando notación K, M, B, T.
 * Centraliza la lógica de formato que estaba duplicada en múltiples archivos.
 * 
 * @param num - Número a formatear
 * @returns String formateado con sufijo o "N/A" si es inválido
 * 
 * @example
 * ```typescript
 * formatLargeNumber(1500000000) // "1.50B"
 * formatLargeNumber(5000000)    // "5.00M"
 * formatLargeNumber(NaN)        // "N/A"
 * ```
 */
export function formatLargeNumber(num: number | string): string {
  const n = Number(num);
  if (isNaN(n)) return 'N/A';
  
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  
  return n.toLocaleString('es-ES');
}

/**
 * Formatea un precio en dólares con 2 decimales.
 * 
 * @param price - Precio a formatear
 * @returns String con formato $XX.XX o "N/A"
 * 
 * @example
 * ```typescript
 * formatPrice(123.456) // "$123.46"
 * formatPrice(0)       // "$0.00"
 * ```
 */
export function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';
  return `$${price.toFixed(2)}`;
}

/**
 * Formatea un porcentaje con 2 decimales.
 * 
 * @param value - Valor a formatear
 * @returns String con formato XX.XX% o "N/A"
 */
export function formatPercentage(value: number | null | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Calcula la diferencia porcentual entre precio actual y DCF.
 * Usado para mostrar si un activo está sobrevalorado o infravalorado.
 * 
 * @param currentPrice - Precio actual del activo
 * @param dcf - Valor intrínseco (DCF)
 * @returns Diferencia porcentual o null si DCF no es válido
 * 
 * @example
 * ```typescript
 * calculateDCFDifference(100, 80)  // 25 (sobrevalorado 25%)
 * calculateDCFDifference(100, 120) // -16.67 (infravalorado)
 * ```
 */
export function calculateDCFDifference(
  currentPrice: number,
  dcf: number | 'N/A'
): number | null {
  if (typeof dcf !== 'number' || dcf <= 0 || currentPrice <= 0) return null;
  // Investing-style potential: (Target - Current) / Current * 100
  // Positive => upside (undervalued), Negative => downside (overvalued)
  return ((dcf - currentPrice) / currentPrice) * 100;
}
