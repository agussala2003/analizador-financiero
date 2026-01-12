// src/features/sectors-industries/hooks/use-industry-performance.ts

import { useQuery } from '@tanstack/react-query';
import { fetchIndustryPerformance } from '@/services/api/sectors-industries-api';
import type { HistoricalIndustryPerformance } from '../types';

/**
 * Custom hook to fetch historical performance data for a specific industry.
 * 
 * @param industry - Name of the industry to fetch performance for
 * @param enabled - Whether the query should execute (default: true when industry is provided)
 * @returns React Query result with historical performance data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useIndustryPerformance('Biotechnology');
 * ```
 */
export function useIndustryPerformance(
  industry: string | null,
  enabled = true
) {
  return useQuery<HistoricalIndustryPerformance[], Error>({
    queryKey: ['industryPerformance', industry],
    queryFn: () => fetchIndustryPerformance(industry!),
    enabled: enabled && !!industry,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
