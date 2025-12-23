
import { useQueries } from '@tanstack/react-query';
import { usePortfolio } from '../../../hooks/use-portfolio';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { AssetData } from '../../../types/dashboard';
import { useMemo } from 'react';

/**
 * Hook to fetch detailed data for all assets in the current portfolio.
 * Used for aggregate analysis like Sector Allocation or Geographic Exposure.
 */
export function usePortfolioAnalytics() {
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const { user, profile } = useAuth();
    const config = useConfig();

    const userId = user?.id ?? null;
    const profileId = profile?.id ?? null;
    const useMockData = config?.useMockData ?? false;

    // Create a query for each holding
    const assetQueries = useQueries({
        queries: holdings.map(holding => {
            return {
                queryKey: ['assetData', holding.symbol, userId, profileId, useMockData] as const,
                queryFn: () => fetchTickerData({
                    queryKey: ['assetData', holding.symbol, config, user, profile]
                }),
                staleTime: 1000 * 60 * 60, // 1 hour stale time for analytics (doesn't need real-time price)
                enabled: !!config && !!holding.symbol,
            };
        }),
    });

    const isLoading = portfolioLoading || assetQueries.some(q => q.isLoading);

    // Aggregate data
    const analyticsData = useMemo(() => {
        if (isLoading) return null;

        const assets = assetQueries
            .map(q => q.data)
            .filter((a): a is AssetData => !!a);

        // Map symbol to asset data for easy lookup
        const assetMap = new Map<string, AssetData>();
        assets.forEach(a => assetMap.set(a.symbol, a));

        // Calculate accumulations
        const sectorAllocation: Record<string, number> = {};
        const countryAllocation: Record<string, number> = {};
        let totalValueAnalyzed = 0;

        holdings.forEach(h => {
            const asset = assetMap.get(h.symbol);
            if (!asset) return;

            // Use current market value if possible, otherwise cost basis as fallback
            // We need price to calculate allocation. holdings from usePortfolio has quantity and cost.
            // asset from fetchTickerData has currentPrice.
            const value = h.quantity * asset.currentPrice;
            totalValueAnalyzed += value;

            // Sector
            const sector = asset.sector || 'Otros';
            sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;

            // Country (if available, otherwise "Desconocido")
            // Note: AssetData definition might need to be checked for 'country'. 
            // Assuming it exists based on standard FMP data model or we add fallback.
            const country = asset.country || 'Otros';
            countryAllocation[country] = (countryAllocation[country] || 0) + value;
        });

        // Convert to percentage array for charts
        const formatData = (map: Record<string, number>) => {
            return Object.entries(map)
                .map(([name, value]) => ({
                    name,
                    value,
                    percentage: totalValueAnalyzed > 0 ? (value / totalValueAnalyzed) * 100 : 0
                }))
                .sort((a, b) => b.value - a.value);
        };

        return {
            sectorAllocation: formatData(sectorAllocation),
            countryAllocation: formatData(countryAllocation),
            totalValue: totalValueAnalyzed,
            assetsLoaded: assets.length,
            totalAssets: holdings.length
        };
    }, [holdings, assetQueries, isLoading]);

    return {
        data: analyticsData,
        isLoading
    };
}
