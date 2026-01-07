// src/services/api/search-api.ts

import { logger } from '../../lib/logger';
import { supabase } from '../../lib/supabase';
import type { Config } from '../../types/config';

/**
 * Resultado de búsqueda de FMP API
 */
export interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
  isAvailable?: boolean; // ✅ Indica si el activo tiene datos en la BD
}

interface FmpSearchResponse {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

/**
 * Busca activos directamente en la caché de Supabase
 */
async function searchInCache(query: string): Promise<SearchResult[]> {
  try {
    const upperQuery = query.toUpperCase();
    const { data, error } = await supabase
      .from('asset_data_cache')
      .select('symbol, data')
      .ilike('symbol', `%${upperQuery}%`)
      .limit(10);

    if (error || !data || data.length === 0) return [];

    return data.map((item) => {
      const assetData = item.data as {
        symbol?: string;
        companyName?: string;
        exchangeFullName?: string;
        currency?: string;
      };

      return {
        symbol: String(item.symbol),
        name: assetData.companyName ?? String(item.symbol),
        currency: assetData.currency ?? 'USD',
        stockExchange: assetData.exchangeFullName ?? 'N/A',
        exchangeShortName: assetData.exchangeFullName ?? 'N/A',
        isAvailable: true // Siempre true porque viene de la caché
      };
    });
  } catch {
    return [];
  }
}

/**
 * Busca empresas por nombre en FMP
 */
async function searchByNameInFmp(query: string, limit = 50): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fmp-proxy', {
      body: { endpointPath: `stable/search-name?query=${encodeURIComponent(query)}&limit=${limit}` }
    });

    if (error || !data) return [];

    // Filtrar que el exchange sea NYSE o NASDAQ
    const results = Array.isArray(data) ? data : [data];
    const filteredResults = results.filter((item: FmpSearchResponse) => item.exchange === 'NYSE' || item.exchange === 'NASDAQ');

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
 * Busca activos (stocks) usando Cache + FMP Search API (Name)
 */
export async function searchAssets(
  query: string,
  _config: Config,
  limit = 10
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  try {
    // Ejecutar búsquedas en paralelo (Caché + API) para asegurar resultados completos
    // No detenemos la búsqueda si hay caché, porque queremos ver sugerencias nuevas de la API
    const [cacheResults, apiResults] = await Promise.all([
      searchInCache(query),
      searchByNameInFmp(query, limit)
    ]);

    // Fusionar y deduplicar: Prioridad CACHÉ
    const seen = new Set(cacheResults.map(r => r.symbol));
    const merged = [...cacheResults];

    for (const res of apiResults) {
      if (!seen.has(res.symbol)) {
        seen.add(res.symbol);
        merged.push(res);
      }
    }

    return merged
      .filter(r => !r.symbol.includes('_'))
      .slice(0, limit);
  } catch (error) {
    void logger.error('SEARCH_ASSETS_FAILED', `Error buscando activos: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}