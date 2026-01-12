// src/services/api/search-api.ts

import { logger } from '../../lib/logger';
import { supabase } from '../../lib/supabase';
import type { Config } from '../../types/config';

/**
 * Resultado de búsqueda unificado
 */
export interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
  isAvailable?: boolean;
}

interface FmpSearchResponse {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

/**
 * Busca activos usando la API de FMP (vía Proxy Supabase Edge Function)
 */
async function searchByNameInFmp(query: string, limit = 50): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fmp-proxy', {
      body: { endpointPath: `stable/search-name?query=${encodeURIComponent(query)}&limit=${limit}` }
    });

    if (error || !data) return [];

    // Filtrar que el exchange sea NYSE o NASDAQ
    const results = Array.isArray(data) ? data : [data];
    const filteredResults = results.filter((item: FmpSearchResponse) => item.exchange === 'NYSE' || item.exchange === 'NASDAQ' || item.exchange === 'AMEX');

    // Filtrar resultados "basura" o internos de FMP (ej: "stock_grades_...")
    return filteredResults
      .filter((item: FmpSearchResponse) => !item.symbol.includes('_'))
      .map((item: FmpSearchResponse) => ({
        symbol: item.symbol,
        name: item.name,
        currency: item.currency,
        stockExchange: item.exchangeFullName,
        exchangeShortName: item.exchange,
        isAvailable: false // API results don't guarantee local data availability
      }));
  } catch (err) {
    void logger.error('FMP_SEARCH_NAME_FAILED', String(err));
    return [];
  }
}


/**
 * Busca activos (stocks) usando exclusivamente la API de FMP
 */
export async function searchAssets(
  query: string,
  _config: Config,
  limit = 50
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  try {
    return await searchByNameInFmp(query, limit);
  } catch (err) {
    console.error("Search assets error:", err);
    return [];
  }
}