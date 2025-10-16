// src/features/dashboard/hooks/useAssetData.ts

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { AssetData } from '../../../types/dashboard';

/**
 * Hook para obtener los datos de un único activo financiero.
 * Utiliza React Query para cacheo, revalidación y manejo de estados.
 * 
 * DEDUPLICACIÓN AUTOMÁTICA:
 * React Query automáticamente deduplica múltiples requests simultáneos con la misma queryKey.
 * Si 5 componentes piden datos de "AAPL" al mismo tiempo, solo se hará 1 request HTTP.
 * 
 * CACHE SHARING:
 * Todos los componentes que usen useAssetData('AAPL') compartirán los mismos datos cacheados.
 * Cuando los datos se actualizan, todos los componentes se re-renderizan automáticamente.
 * 
 * @param ticker - El símbolo del activo a buscar.
 * @returns El estado de la query de React Query para ese activo.
 */
export function useAssetData(ticker: string) {
  const { user, profile } = useAuth();
  const config = useConfig();

  // Estabilizar valores para la query key (usar solo primitivos)
  const userId = user?.id ?? null;
  const profileId = profile?.id ?? null;
  const useMockData = config?.useMockData ?? false;

  return useQuery<AssetData, Error, AssetData, readonly [string, string, string | null, string | null, boolean]>({
    // La queryKey identifica unívocamente esta petición de datos.
    // React Query usa esto para deduplicación y cache sharing
    // IMPORTANTE: Usar solo valores primitivos para evitar refetches por cambios de referencia
    queryKey: ['assetData', ticker, userId, profileId, useMockData] as const,
    
    // La función que se ejecutará para obtener los datos.
    queryFn: () => fetchTickerData({ queryKey: ['assetData', ticker, config, user, profile] }),
    
    // Solo activa esta query si el ticker existe.
    enabled: !!ticker && ticker.length > 0,
    
    // Cache optimizado para asset data (precios cambian frecuentemente)
    staleTime: 1000 * 60 * 5, // 5 minutos - Revalidar después de este tiempo
    gcTime: 1000 * 60 * 15, // 15 minutos - Mantener en cache aunque no esté en uso
    
    // Configuración de revalidación - No revalidar automáticamente
    refetchOnWindowFocus: false, // No revalidar al cambiar de pestaña del navegador
    refetchOnReconnect: false, // No revalidar al recuperar conexión a internet
    
    // Retry configuration
    retry: 2, // Solo 2 reintentos en caso de error
    retryDelay: 1000, // 1 segundo entre reintentos
  });
}