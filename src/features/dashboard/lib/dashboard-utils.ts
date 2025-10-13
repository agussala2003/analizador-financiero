// src/features/dashboard/lib/dashboard-utils.ts

import type { AssetData } from '../../../types/dashboard';

/**
 * Valida si un símbolo de ticker es válido.
 * 
 * @param ticker - Símbolo a validar
 * @returns true si el ticker es válido
 */
export function isValidTicker(ticker: string): boolean {
  // Tickers suelen ser 1-5 caracteres, solo letras y números
  const tickerRegex = /^[A-Z0-9]{1,5}$/;
  return tickerRegex.test(ticker.toUpperCase());
}

/**
 * Normaliza un ticker a uppercase y sin espacios.
 * 
 * @param ticker - Ticker a normalizar
 * @returns Ticker normalizado
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/**
 * Filtra activos que han cargado correctamente.
 * 
 * @param assets - Array de activos que pueden ser undefined
 * @returns Array filtrado de activos válidos
 */
export function filterValidAssets(
  assets: (AssetData | undefined)[]
): AssetData[] {
  return assets.filter((asset): asset is AssetData => asset !== undefined);
}

/**
 * Verifica si hay queries en proceso de carga.
 * 
 * @param queries - Array de queries de React Query
 * @returns true si alguna query está cargando
 */
export function hasLoadingQueries(
  queries: { isLoading: boolean }[]
): boolean {
  return queries.some((query) => query.isLoading);
}

/**
 * Verifica si es la carga inicial (sin datos previos).
 * 
 * @param isLoading - Si está cargando
 * @param assetsCount - Cantidad de activos cargados
 * @returns true si es carga inicial
 */
export function isInitialLoad(
  isLoading: boolean,
  assetsCount: number
): boolean {
  return isLoading && assetsCount === 0;
}

/**
 * Extrae símbolos únicos de una lista de holdings.
 * 
 * @param holdings - Array de holdings del portfolio
 * @returns Array de símbolos únicos
 */
export function extractUniqueSymbols(
  holdings: { symbol: string }[]
): string[] {
  return [...new Set(holdings.map((h) => h.symbol))];
}
