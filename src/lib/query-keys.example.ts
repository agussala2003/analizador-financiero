// src/lib/query-keys.example.ts

/**
 * EJEMPLOS DE USO DE QUERY KEYS
 * 
 * Este archivo muestra cómo usar las query keys centralizadas
 * para maximizar la deduplicación y facilitar la invalidación.
 * 
 * NOTA: Este es un archivo de EJEMPLOS y DOCUMENTACIÓN.
 * Los tipos any son intencionales para mantener los ejemplos simples.
 */

 
/* eslint-disable @typescript-eslint/require-await */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

// ============================================
// EJEMPLO 1: Hook básico con query keys
// ============================================

export function useAssetQuote(symbol: string) {
  return useQuery({
    queryKey: queryKeys.assets.quote(symbol),
    queryFn: async () => {
      const response = await fetch(`/api/quote/${symbol}`);
      return response.json();
    },
    enabled: !!symbol,
  });
}

// ============================================
// EJEMPLO 2: Invalidación después de mutation
// ============================================

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ symbol }),
      });
      return response.json();
    },
    onSuccess: (_, symbol) => {
      // Invalidar la lista completa de watchlist
      void queryClient.invalidateQueries({
        queryKey: queryKeys.watchlist.all,
      });

      // Invalidar el check específico de este símbolo
      void queryClient.invalidateQueries({
        queryKey: queryKeys.watchlist.isInWatchlist(symbol),
      });
    },
  });
}

// ============================================
// EJEMPLO 3: Prefetch con query keys
// ============================================

export function usePrefetchAssetOnHover() {
  const queryClient = useQueryClient();

  const prefetchAsset = (symbol: string) => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.assets.detail(symbol),
      queryFn: async () => {
        const response = await fetch(`/api/assets/${symbol}`);
        return response.json();
      },
      // Cache por 1 minuto después del prefetch
      staleTime: 1000 * 60,
    });
  };

  return { prefetchAsset };
}

// ============================================
// EJEMPLO 4: Invalidación granular
// ============================================

export function useRefreshAssetData() {
  const queryClient = useQueryClient();

  const refreshAsset = (symbol: string) => {
    // Opción 1: Invalidar todo sobre un asset
    void queryClient.invalidateQueries({
      queryKey: queryKeys.assets.detail(symbol),
    });

    // Opción 2: Invalidar solo un aspecto específico
    void queryClient.invalidateQueries({
      queryKey: queryKeys.assets.quote(symbol),
    });

    // Opción 3: Invalidar TODOS los assets (usar con cuidado)
    void queryClient.invalidateQueries({
      queryKey: queryKeys.assets.all,
    });
  };

  return { refreshAsset };
}

// ============================================
// EJEMPLO 5: Reset de cache al logout
// ============================================

export function useLogout() {
  const queryClient = useQueryClient();

  const logout = async () => {
    // Limpiar datos sensibles del usuario
    queryClient.removeQueries({
      queryKey: queryKeys.portfolio.all,
    });

    queryClient.removeQueries({
      queryKey: queryKeys.watchlist.all,
    });

    queryClient.removeQueries({
      queryKey: queryKeys.auth.all,
    });

    // Mantener datos públicos (assets, news)
    // No necesitan ser removidos
  };

  return { logout };
}

// ============================================
// EJEMPLO 6: Optimistic Updates
// ============================================

export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, action }: { symbol: string; action: 'add' | 'remove' }) => {
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: action === 'add' ? 'POST' : 'DELETE',
      });
      return response.json();
    },
    // Optimistic update: actualizar UI antes de que el servidor responda
    onMutate: async ({ symbol, action }) => {
      // Cancelar queries en curso para evitar race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.watchlist.all,
      });

      // Snapshot del estado anterior (para rollback)
      const previousWatchlist = queryClient.getQueryData(
        queryKeys.watchlist.list()
      );

      // Actualizar cache optimistamente
      queryClient.setQueryData(queryKeys.watchlist.isInWatchlist(symbol), action === 'add');

      // Retornar context para rollback
      return { previousWatchlist };
    },
    // Si falla, revertir al estado anterior
    onError: (_err, _variables, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(
          queryKeys.watchlist.list(),
          context.previousWatchlist
        );
      }
    },
    // Refetch después de success o error para sincronizar
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.watchlist.all,
      });
    },
  });
}

// ============================================
// VENTAJAS DE ESTE PATRÓN:
// ============================================

/**
 * 1. DEDUPLICACIÓN AUTOMÁTICA
 *    - Múltiples useAssetQuote('AAPL') = 1 solo request
 *    - React Query detecta keys idénticas y comparte el resultado
 * 
 * 2. INVALIDACIÓN CONSISTENTE
 *    - queryKeys.assets.detail('AAPL') siempre invalida lo mismo
 *    - No hay typos ni inconsistencias entre archivos
 * 
 * 3. TYPE SAFETY
 *    - TypeScript verifica que las keys existan
 *    - Autocomplete en el IDE
 * 
 * 4. FÁCIL REFACTORIZACIÓN
 *    - Cambiar la estructura de keys en un solo lugar
 *    - Todos los hooks se actualizan automáticamente
 * 
 * 5. DEBUGGING MEJORADO
 *    - React Query DevTools muestra keys legibles
 *    - Fácil identificar qué query es cuál
 */
