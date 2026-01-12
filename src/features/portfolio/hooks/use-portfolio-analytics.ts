// src/features/portfolio/hooks/use-portfolio-analytics.ts

import { useQueries } from '@tanstack/react-query';
import { usePortfolio } from '../../../hooks/use-portfolio';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { AssetData } from '../../../types/dashboard';
import { useMemo } from 'react';

export function usePortfolioAnalytics() {
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const { user, profile } = useAuth();
    const config = useConfig();

    const userId = user?.id ?? null;
    const profileId = profile?.id ?? null;
    const useMockData = config?.useMockData ?? false;

    const assetQueries = useQueries({
        queries: holdings.map(holding => ({
            queryKey: ['assetData', holding.symbol, userId, profileId, useMockData] as const,
            queryFn: () => fetchTickerData({
                queryKey: ['assetData', holding.symbol, config, user, profile]
            }),
            staleTime: 1000 * 60 * 60, // 1 hora
            enabled: !!config && !!holding.symbol,
        })),
    });

    const isLoading = portfolioLoading || assetQueries.some(q => q.isLoading);

    const analyticsData = useMemo(() => {
        if (isLoading) return null;

        // Extraer datos exitosos
        const assets = assetQueries
            .map(q => q.data)
            .filter((a): a is AssetData => !!a);

        const assetMap = new Map<string, AssetData>();
        assets.forEach(a => {
            if (a.profile?.symbol) assetMap.set(a.profile.symbol, a);
        });

        const sectorAllocation: Record<string, number> = {};
        const countryAllocation: Record<string, number> = {};
        let totalValueAnalyzed = 0;

        holdings.forEach(h => {
            const asset = assetMap.get(h.symbol);
            // Si no tenemos datos completos, intentamos usar datos básicos del holding si existen
            const currentPrice = asset?.quote?.price ?? asset?.profile?.price ?? h.assetData.quote?.price ?? 0;

            const value = h.quantity * currentPrice;
            totalValueAnalyzed += value;

            // Datos de perfil
            const sector = asset?.profile?.sector ?? 'Otros';
            const country = asset?.profile?.country ?? 'Otros';

            sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
            countryAllocation[country] = (countryAllocation[country] || 0) + value;
        });

        const formatData = (map: Record<string, number>) => {
            return Object.entries(map)
                .map(([name, value]) => ({
                    name,
                    value,
                    percentage: totalValueAnalyzed > 0 ? (value / totalValueAnalyzed) * 100 : 0
                }))
                .sort((a, b) => b.value - a.value);
        };

        const result = {
            sectorAllocation: formatData(sectorAllocation),
            countryAllocation: formatData(countryAllocation),
            totalValue: totalValueAnalyzed,
            assetsLoaded: assets.length,
            totalAssets: holdings.length
        };

        return result;
    }, [holdings, assetQueries, isLoading]);

    return {
        data: analyticsData,
        isLoading
    };
}