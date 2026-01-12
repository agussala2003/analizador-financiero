// src/features/sectors-industries/hooks/use-sectors.ts

import { useQuery } from '@tanstack/react-query';
import { fetchAvailableSectors } from '@/services/api/sectors-industries-api';
import type { Sector } from '../types';

/**
 * Custom hook to fetch the list of available sectors.
 * 
 * @returns React Query result with sectors data
 * 
 * @example
 * ```tsx
 * const { data: sectors, isLoading, error } = useSectors();
 * ```
 */
export function useSectors() {
  return useQuery<Sector[], Error>({
    queryKey: ['sectors'],
    queryFn: fetchAvailableSectors,
    staleTime: 1000 * 60 * 60, // 1 hour - sectors list doesn't change frequently
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
