// src/features/sectors-industries/hooks/use-sector-performance.ts

import { useQuery } from '@tanstack/react-query';
import { fetchSectorPerformance } from '@/services/api/sectors-industries-api';
import type { HistoricalSectorPerformance } from '../types';

/**
 * Custom hook to fetch historical performance data for a specific sector.
 * 
 * @param sector - Name of the sector to fetch performance for
 * @param enabled - Whether the query should execute (default: true when sector is provided)
 * @returns React Query result with historical performance data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSectorPerformance('Energy');
 * ```
 */
export function useSectorPerformance(
  sector: string | null,
  enabled = true
) {
  return useQuery<HistoricalSectorPerformance[], Error>({
    queryKey: ['sectorPerformance', sector],
    queryFn: () => fetchSectorPerformance(sector!),
    enabled: enabled && !!sector,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
