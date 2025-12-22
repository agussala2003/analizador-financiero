
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { Holding } from '../../../types/portfolio';
import { HistoricalHolding } from '../../../types/dashboard';
import { calculatePerformanceMetrics, PerformanceMetrics } from '../../../utils/performance-metrics';
import { useMemo } from 'react';

/**
 * Hook to fetch historical data for all holdings in the portfolio and calculate aggregate metrics.
 * 
 * Strategy:
 * 1. Fetch full data (including history) for every asset in the portfolio.
 * 2. Calculate "Buy and Hold" portfolio value history:
 *    PortfolioValue(t) = Sum(Quantity_i * Price_i(t))
 * 3. Calculate metrics on this aggregate series.
 */
export function usePortfolioHistory(holdings: Holding[]) {
    const { user, profile } = useAuth();
    const config = useConfig();

    const userId = user?.id ?? null;
    const profileId = profile?.id ?? null;
    const useMockData = config?.useMockData ?? false;

    // 1. Fetch data for all holdings in parallel using useQueries
    const queries = useQueries({
        queries: holdings.map((holding) => ({
            queryKey: ['assetData', holding.symbol, userId, profileId, useMockData] as const,
            queryFn: () => fetchTickerData({ queryKey: ['assetData', holding.symbol, config, user, profile] }),
            staleTime: 1000 * 60 * 5, // 5 min
            enabled: !!holding.symbol,
        })),
    });

    const isLoading = queries.some((q) => q.isLoading);
    const isError = queries.some((q) => q.isError);

    // 2. Aggregate history
    const portfolioHistory = useMemo(() => {
        if (isLoading || isError || holdings.length === 0) return [];

        // Map symbol -> history array
        const histories: Record<string, HistoricalHolding[]> = {};

        queries.forEach((q, index) => {
            const symbol = holdings[index].symbol;
            if (q.data?.historicalRaw) {
                histories[symbol] = q.data.historicalRaw;
            }
        });

        if (Object.keys(histories).length === 0) return [];

        // Find common time period (Max of start dates)
        let maxStart = 0;

        // Determine the latest start date among all assets (common period)
        const symbolsWithData = Object.keys(histories);

        // Find the symbol with the latest start date (shortest history)
        let driverSymbol = symbolsWithData[0];

        symbolsWithData.forEach(sym => {
            const hist = histories[sym];
            if (hist.length > 0) {
                const start = new Date(hist[0].date).getTime();
                if (start > maxStart) {
                    maxStart = start;
                    driverSymbol = sym;
                }
            }
        });

        if (!histories[driverSymbol]) return [];

        // Use the driver symbol's dates as the master timeline
        const relevantDates = histories[driverSymbol]
            .filter(d => new Date(d.date).getTime() >= maxStart)
            .map(d => d.date);

        const aggregated: HistoricalHolding[] = [];

        for (const date of relevantDates) {
            // Calculate portfolio value for this date
            let totalValue = 0;
            let incomplete = false;

            for (const h of holdings) {
                const hist = histories[h.symbol];
                // If asset not in history map (e.g. failed fetch), skip or handle
                if (!hist) {
                    // Skip this asset's contribution or mark incomplete?
                    // If we skip, the total value drops artificially.
                    // Assuming we have history for all fetched assets.
                    // If query failed, we probably returned early or don't have it in histories.
                    // If holding is in holdings but not in histories, it failed.
                    continue;
                }

                // Find price at this date
                const dayData = hist.find(d => d.date === date);

                if (!dayData) {
                    incomplete = true;
                    break;
                }

                totalValue += h.quantity * dayData.close;
            }

            if (!incomplete) {
                aggregated.push({
                    symbol: 'PORTFOLIO',
                    date: date,
                    close: totalValue,
                    open: totalValue, // Approximation
                    high: totalValue,
                    low: totalValue,
                    volume: 0,
                    change: 0,
                    changePercent: 0,
                    vwap: totalValue
                });
            }
        }

        return aggregated;

    }, [queries, holdings]);

    // 3. Calculate metrics on portfolioHistory
    const metrics: PerformanceMetrics = useMemo(() => {
        return calculatePerformanceMetrics(portfolioHistory);
    }, [portfolioHistory]);

    return {
        portfolioHistory,
        metrics,
        isLoading,
        isError
    };
}
