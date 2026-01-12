// src/features/dashboard/lib/dashboard-utils.ts

import type { AssetData } from '../../../types/dashboard';

/**
 * Valida si un símbolo de ticker es válido.
 * Soporta letras, números, puntos y guiones (ej: GGAL.BA, BTC-USD)
 */
export function isValidTicker(ticker: string): boolean {
  if (!ticker) return false;
  // Actualizado: Permite hasta 12 caracteres, puntos y guiones para activos internacionales/crypto
  const tickerRegex = /^[A-Z0-9.-]{1,12}$/;
  return tickerRegex.test(ticker.trim().toUpperCase());
}

/**
 * Normaliza un ticker a uppercase y sin espacios.
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/**
 * Filtra activos que han cargado correctamente.
 */
export function filterValidAssets(
  assets: (AssetData | undefined)[]
): AssetData[] {
  return assets.filter((asset): asset is AssetData => asset !== undefined && asset !== null);
}

/**
 * Verifica si hay queries en proceso de carga.
 */
export function hasLoadingQueries(
  queries: { isLoading: boolean }[]
): boolean {
  return queries.some((query) => query.isLoading);
}

/**
 * Verifica si es la carga inicial (sin datos previos).
 */
export function isInitialLoad(
  isLoading: boolean,
  assetsCount: number
): boolean {
  return isLoading && assetsCount === 0;
}

/**
 * Extrae símbolos únicos de una lista de holdings.
 */
export function extractUniqueSymbols(
  holdings: { symbol: string }[]
): string[] {
  return [...new Set(holdings.map((h) => h.symbol))];
}