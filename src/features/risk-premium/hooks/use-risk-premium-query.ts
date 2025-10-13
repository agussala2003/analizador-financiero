// src/features/risk-premium/hooks/use-risk-premium-query.ts

import { useQuery } from '@tanstack/react-query';
import { fetchRiskPremiumData } from '../lib/risk-premium.utils';

/**
 * Query key factory for risk premium
 */
export const riskPremiumKeys = {
  all: ['riskPremium'] as const,
  list: () => [...riskPremiumKeys.all, 'list'] as const,
};

/**
 * Hook to fetch risk premium data with TanStack Query
 * 
 * Features:
 * - Automatic 24h cache (staleTime)
 * - Background refetch when stale
 * - Retry on failure
 * - Deduplication of concurrent requests
 */
export function useRiskPremiumQuery() {
  return useQuery({
    queryKey: riskPremiumKeys.list(),
    queryFn: fetchRiskPremiumData,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data doesn't change frequently
    gcTime: 48 * 60 * 60 * 1000, // 48 hours cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch on window focus for this data
  });
}
