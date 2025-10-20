/**
 * Hook para obtener información de frescura de los datos del cache
 * 
 * Lee la tabla asset_data_cache de Supabase para determinar cuándo
 * se actualizaron los datos de los activos por última vez.
 * 
 * @example
 * ```tsx
 * const { oldestUpdate, isLoading } = useCacheFreshness(['AAPL', 'GOOGL']);
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface CacheFreshnessResult {
  /** Fecha de la actualización más antigua entre todos los símbolos */
  oldestUpdate: Date | null;
  /** Fecha de la actualización más reciente */
  newestUpdate: Date | null;
  /** Indica si está cargando */
  isLoading: boolean;
  /** Indica si hubo un error */
  isError: boolean;
}

/**
 * Hook que obtiene las fechas de última actualización de los activos en cache
 * 
 * @param symbols - Array de símbolos de activos
 * @returns Información sobre la frescura del cache
 */
export function useCacheFreshness(symbols: string[]): CacheFreshnessResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cacheFreshness', symbols.sort().join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return null;

      const { data, error } = await supabase
        .from('asset_data_cache')
        .select('symbol, last_updated_at')
        .in('symbol', symbols);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data;
    },
    enabled: symbols.length > 0,
    staleTime: 1000 * 30, // 30 segundos - actualizar frecuentemente para reflejar cambios
    gcTime: 1000 * 60, // 1 minuto
  });

  if (!data || data.length === 0) {
    return {
      oldestUpdate: null,
      newestUpdate: null,
      isLoading,
      isError,
    };
  }

  const dates = data
    .map((item) => new Date(item.last_updated_at as string).getTime())
    .filter((time) => !isNaN(time));

  if (dates.length === 0) {
    return {
      oldestUpdate: null,
      newestUpdate: null,
      isLoading,
      isError,
    };
  }

  return {
    oldestUpdate: new Date(Math.min(...dates)),
    newestUpdate: new Date(Math.max(...dates)),
    isLoading,
    isError,
  };
}
