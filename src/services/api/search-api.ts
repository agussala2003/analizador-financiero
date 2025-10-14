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

/**
 * Busca activos directamente en la caché de Supabase
 * @param query - Término de búsqueda parcial (ej: "NVD" para encontrar "NVDA")
 * @returns Array de resultados encontrados en la caché
 */
async function searchInCache(query: string): Promise<SearchResult[]> {
  try {
    const upperQuery = query.toUpperCase();
    
    // Buscar en la caché por símbolo que empiece con o contenga el query
    const { data, error } = await supabase
      .from('asset_data_cache')
      .select('symbol, data')
      .ilike('symbol', `%${upperQuery}%`)
      .limit(10);

    if (error || !data || data.length === 0) {
      return [];
    }

    // Convertir a SearchResult format usando AssetData structure
    const results: SearchResult[] = data.map((item) => {
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

    return results;
  } catch {
    return [];
  }
}

/**
 * Busca activos (stocks) usando FMP Search API
 * @param query - Término de búsqueda (símbolo o nombre de empresa)
 * @param config - Configuración de la app
 * @param limit - Número máximo de resultados (default: 10)
 * @returns Array de resultados de búsqueda
 */
export async function searchAssets(
  query: string,
  _config: Config,
  limit = 10
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  try {
    // ✅ Buscar directamente en la caché de Supabase
    const results = await searchInCache(query);
    
    // Limitar resultados
    return results.slice(0, limit);
  } catch (error) {
    void logger.error('SEARCH_ASSETS_FAILED', `Error buscando activos: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
