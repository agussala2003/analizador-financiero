/**
 * Hook para obtener información de frescura de datos POR ACTIVO INDIVIDUAL
 * 
 * Similar a useCacheFreshness pero retorna un Map con la fecha de actualización
 * de cada símbolo individualmente.
 * 
 * @example
 * ```tsx
 * const { freshnessMap, isLoading } = useAssetFreshness(['AAPL', 'GOOGL']);
 * const appleUpdateDate = freshnessMap.get('AAPL');
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface AssetFreshnessResult {
  /** Map de símbolo → fecha de última actualización */
  freshnessMap: Map<string, Date>;
  /** Indica si está cargando */
  isLoading: boolean;
  /** Indica si hubo un error */
  isError: boolean;
}

/**
 * Hook que obtiene las fechas de última actualización por activo individual
 * 
 * @param symbols - Array de símbolos de activos
 * @returns Map con la fecha de actualización de cada símbolo
 */
export function useAssetFreshness(symbols: string[]): AssetFreshnessResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['assetFreshness', symbols.sort().join(',')],
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
    staleTime: 1000 * 30, // 30 segundos - actualizar frecuentemente
    gcTime: 1000 * 60, // 1 minuto
  });

  const freshnessMap = new Map<string, Date>();

  if (data && data.length > 0) {
    data.forEach((item) => {
      const date = new Date(item.last_updated_at as string);
      if (!isNaN(date.getTime())) {
        freshnessMap.set(item.symbol as string, date);
      }
    });
  }

  return {
    freshnessMap,
    isLoading,
    isError,
  };
}
