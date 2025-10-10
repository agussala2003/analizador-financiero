// src/features/dashboard/hooks/useAssetData.ts

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { AssetData } from '../../../types/dashboard';
import type { Config } from '../../../types/config';
import type { Profile } from '../../../types/auth';
import type { User } from '@supabase/supabase-js';

/**
 * Hook para obtener los datos de un único activo financiero.
 * Utiliza React Query para cacheo, revalidación y manejo de estados.
 * @param ticker - El símbolo del activo a buscar.
 * @returns El estado de la query de React Query para ese activo.
 */
export function useAssetData(ticker: string) {
  const { user, profile } = useAuth();
  const config = useConfig();

  return useQuery<AssetData, Error, AssetData, [string, string, Config, User | null, Profile | null]>({
    // La queryKey identifica unívocamente esta petición de datos.
    queryKey: ['assetData', ticker, config, user, profile],
    
    // La función que se ejecutará para obtener los datos.
    queryFn: fetchTickerData,
    
    // Solo activa esta query si el ticker existe.
    enabled: !!ticker,
  });
}