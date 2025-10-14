// src/features/risk-premium/lib/risk-premium.utils.ts

import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/logger';
import { errorToString } from '../../../utils/type-guards';
import { RiskPremiumData, CachedRiskPremiumData } from '../types/risk-premium.types';

/**
 * Cache key for risk premium data in Supabase
 */
export const RISK_PREMIUM_CACHE_KEY = 'market_risk_premium';

/**
 * Cache duration in milliseconds (24 hours)
 */
export const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Extracts the FMP proxy endpoint from config object
 */
export function extractFmpProxyEndpoint(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';

  const api = (raw as { api?: unknown }).api;
  if (!api || typeof api !== 'object') return '';

  const fmpProxyEndpoints = (api as { fmpProxyEndpoints?: unknown }).fmpProxyEndpoints;
  if (!fmpProxyEndpoints || typeof fmpProxyEndpoints !== 'object') return '';

  const marketRiskPremium = (
    fmpProxyEndpoints as { marketRiskPremium?: unknown }
  ).marketRiskPremium;

  if (typeof marketRiskPremium === 'string') {
    return marketRiskPremium;
  }

  return '';
}

/**
 * Gets the color class for risk premium based on value
 * - Green: <= 5%
 * - Yellow: <= 10%
 * - Red: > 10%
 */
export function getRiskColorClass(premium: number): string {
  if (premium <= 5) return 'text-green-600 dark:text-green-400';
  if (premium <= 10) return 'text-yellow-600 dark:text-yellow-500';
  return 'text-red-600 dark:text-red-500';
}

/**
 * Gets the risk level label based on premium value
 */
export function getRiskLevel(premium: number): string {
  if (premium <= 5) return 'Bajo';
  if (premium <= 10) return 'Moderado';
  return 'Alto';
}

/**
 * Sorts risk premium data alphabetically by country
 */
export function sortDataByCountry(data: RiskPremiumData[]): RiskPremiumData[] {
  return [...data].sort((a, b) => a.country.localeCompare(b.country));
}

/**
 * Extracts unique continents from data and sorts them
 */
export function extractContinents(data: RiskPremiumData[]): string[] {
  return [...new Set(data.map((item) => item.continent))].sort();
}

/**
 * Checks if cached data is still valid (less than 24 hours old)
 */
export function isCacheValid(lastUpdatedAt: string): boolean {
  const cacheDate = new Date(lastUpdatedAt);
  const expiryDate = new Date(Date.now() - CACHE_DURATION_MS);
  return cacheDate > expiryDate;
}

/**
 * Fetches cached risk premium data from Supabase
 */
export async function fetchCachedData(): Promise<CachedRiskPremiumData | null> {
  try {
    const { data, error } = await supabase
      .from('asset_data_cache')
      .select('data, last_updated_at')
      .eq('symbol', RISK_PREMIUM_CACHE_KEY)
      .single();

      console.log('Fetched cached data:', { data, error });

    // PGRST116 = no rows returned (not an error)
    if (error && error.code !== 'PGRST116') {
      throw new Error(errorToString(error));
    }

    if (!data) return null;

    return data as CachedRiskPremiumData;
  } catch (error) {
    void logger.error('RISK_PREMIUM_CACHE_FETCH_FAILED', errorToString(error));
    return null;
  }
}

/**
 * Fetches fresh risk premium data from FMP API via Supabase Edge Function
 */
export async function fetchFreshData(endpoint: string): Promise<RiskPremiumData[]> {
  try {
    const invokeResult = await supabase.functions.invoke('fmp-proxy', {
      body: { endpointPath: endpoint },
    });

    const apiData: RiskPremiumData[] | null =
      invokeResult && 'data' in invokeResult
        ? (invokeResult.data as RiskPremiumData[] | null)
        : null;

    const apiError: unknown =
      invokeResult && 'error' in invokeResult ? invokeResult.error : null;

    if (apiError) {
      throw new Error(errorToString(apiError));
    }

    return apiData ?? [];
  } catch (error) {
    void logger.error('RISK_PREMIUM_API_FETCH_FAILED', errorToString(error));
    throw error;
  }
}

/**
 * Saves risk premium data to Supabase cache
 */
export async function saveCacheData(data: RiskPremiumData[]): Promise<void> {
  try {
    await supabase.from('asset_data_cache').upsert({
      symbol: RISK_PREMIUM_CACHE_KEY,
      data,
      last_updated_at: new Date().toISOString(),
    });
  } catch (error) {
    void logger.error('RISK_PREMIUM_CACHE_SAVE_FAILED', errorToString(error));
    // Don't throw - cache save failure shouldn't break the feature
  }
}

/**
 * Main function to fetch risk premium data with caching
 * Returns cached data as fallback if API fails
 */
export async function fetchRiskPremiumData(): Promise<RiskPremiumData[]> {
  // Check cache first
  const cached = await fetchCachedData();

  if (cached && isCacheValid(cached.last_updated_at)) {
    return cached.data || [];
  }

  // Cache miss or expired - try to fetch fresh data
  try {
    // Get config from public/config.json
    const configResponse = await fetch('/config.json');
    const config: unknown = await configResponse.json();
    
    const endpoint = extractFmpProxyEndpoint(config);
    if (!endpoint) {
      throw new Error('No se encontró el endpoint de riesgo país en la configuración.');
    }

    const freshData = await fetchFreshData(endpoint);
    const sortedData = sortDataByCountry(freshData);

    // Save to cache (fire and forget)
    void saveCacheData(sortedData);

    return sortedData;
  } catch (error) {
    // If API fails, return cached data even if expired
    void logger.warn('RISK_PREMIUM_API_FAILED_USING_CACHE', errorToString(error));
    
    if (cached?.data) {
      return cached.data;
    }

    // No cache available - throw error
    throw error;
  }
}
