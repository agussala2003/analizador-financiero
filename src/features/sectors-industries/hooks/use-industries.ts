// src/features/sectors-industries/hooks/use-industries.ts

import { useQuery } from '@tanstack/react-query';
import { fetchAvailableIndustries } from '@/services/api/sectors-industries-api';
import type { Industry } from '../types';

/**
 * Custom hook to fetch the list of available industries.
 * 
 * @returns React Query result with industries data
 * 
 * @example
 * ```tsx
 * const { data: industries, isLoading, error } = useIndustries();
 * ```
 */
export function useIndustries() {
  return useQuery<Industry[], Error>({
    queryKey: ['industries'],
    queryFn: fetchAvailableIndustries,
    staleTime: 1000 * 60 * 60, // 1 hour - industries list doesn't change frequently
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
