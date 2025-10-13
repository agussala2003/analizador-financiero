// src/hooks/use-prefetch-asset.ts

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { fetchTickerData } from '../services/api/asset-api';
import { useConfig } from './use-config';
import { useAuth } from './use-auth';

/**
 * Hook para prefetch de datos de assets
 * 
 * Permite pre-cargar datos antes de que el usuario los necesite,
 * mejorando significativamente la perceived performance.
 * 
 * Casos de uso:
 * - Hover sobre asset cards en watchlist
 * - Focus en links de assets
 * - Prefetch de página siguiente en tablas paginadas
 * 
 * @example
 * ```tsx
 * function AssetCard({ symbol }) {
 *   const { prefetchAsset } = usePrefetchAsset();
 *   
 *   return (
 *     <div 
 *       onMouseEnter={() => prefetchAsset(symbol)}
 *       onFocus={() => prefetchAsset(symbol)}
 *     >
 *       {symbol}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrefetchAsset() {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { user, profile } = useAuth();

  /**
   * Prefetch completo de un asset
   * Solo hace fetch si los datos no están en cache o están stale
   * 
   * IMPORTANTE: Este prefetch es "agresivo" - carga todos los datos del asset.
   * Usar con cuidado en hover para evitar muchas peticiones innecesarias.
   */
  const prefetchAsset = (symbol: string) => {
    if (!symbol || !config) return;

    void queryClient.prefetchQuery({
      queryKey: queryKeys.assets.detail(symbol),
      queryFn: ({ queryKey }) => fetchTickerData({ 
        queryKey: [queryKey[0] as string, symbol, config, user, profile] 
      }),
      staleTime: 5 * 60 * 1000, // 5 minutos - balance entre frescura y performance
    });
  };

  /**
   * Prefetch ligero - solo verifica si hay datos en cache
   * Si hay datos (aunque sean stale), no hace fetch
   * Útil para hover donde queremos ser conservadores con las peticiones
   */
  const prefetchAssetIfNotCached = (symbol: string) => {
    if (!symbol || !config) return;

    const existingData = queryClient.getQueryData(queryKeys.assets.detail(symbol));
    
    // Solo prefetch si NO hay datos en absoluto
    if (!existingData) {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.assets.detail(symbol),
        queryFn: ({ queryKey }) => fetchTickerData({ 
          queryKey: [queryKey[0] as string, symbol, config, user, profile] 
        }),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  /**
   * Prefetch múltiples assets
   * Útil para prefetch de siguiente página en paginación
   */
  const prefetchAssets = (symbols: string[]) => {
    symbols.forEach(symbol => prefetchAssetIfNotCached(symbol));
  };

  return {
    prefetchAsset,
    prefetchAssetIfNotCached,
    prefetchAssets,
  };
}
