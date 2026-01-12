// src/features/portfolio/hooks/use-portfolio-history.ts

import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { fetchTickerData } from '../../../services/api/asset-api';
import { Holding } from '../../../types/portfolio';
import { AssetHistorical } from '../../../types/dashboard';
import { calculatePerformanceMetrics, PerformanceMetrics } from '../../../utils/performance-metrics';
import { useMemo } from 'react';

/**
 * Hook para obtener datos históricos agregados del portafolio.
 * Calcula el valor histórico del portafolio basado en la estrategia "Buy and Hold" con las tenencias actuales.
 */
export function usePortfolioHistory(holdings: Holding[]) {
    const { user, profile } = useAuth();
    const config = useConfig();

    const userId = user?.id ?? null;
    const profileId = profile?.id ?? null;
    const useMockData = config?.useMockData ?? false;

    // 1. Obtener datos completos para cada activo en paralelo
    const queries = useQueries({
        queries: holdings.map((holding) => ({
            queryKey: ['assetData', holding.symbol, userId, profileId, useMockData] as const,
            queryFn: () => fetchTickerData({ queryKey: ['assetData', holding.symbol, config, user, profile] }),
            staleTime: 1000 * 60 * 60, // 1 hora (historial no cambia tanto)
            enabled: !!holding.symbol,
        })),
    });

    const isLoading = queries.some((q) => q.isLoading);
    const isError = queries.some((q) => q.isError);

    // 2. Agregar historial
    const portfolioHistory = useMemo(() => {
        if (isLoading || isError || holdings.length === 0) return [];

        // Mapa: Símbolo -> Map<Fecha, ClosePrice>
        const historyMap: Record<string, Map<string, number>> = {};
        const availableDatesPerAsset: Record<string, string[]> = {};

        // Validar que todos los queries tengan datos
        const allDataLoaded = queries.every(q => q.data?.historicalReturns?.length);
        if (!allDataLoaded) return [];

        let latestStartDate = 0; // Timestamp de la fecha más RECIENTE de inicio (el "maximo de los minimos")
        let driverSymbol = '';

        queries.forEach((q, index) => {
            const holding = holdings[index];
            const rawHistory = q.data?.historicalReturns ?? [];

            // 1. Ordenar DESC (Más reciente a más antiguo) para consistencia
            // FMP suele devolver DESC.
            const sortedHistory = [...rawHistory].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            if (sortedHistory.length > 0) {
                // Crear Map para lookup rápido O(1)
                const priceMap = new Map<string, number>();
                const dates: string[] = [];

                sortedHistory.forEach(h => {
                    priceMap.set(h.date, h.close);
                    dates.push(h.date);
                });

                historyMap[holding.symbol] = priceMap;
                availableDatesPerAsset[holding.symbol] = dates;

                // El último elemento es el más antiguo (porque ordenamos DESC)
                const oldestDateStr = sortedHistory[sortedHistory.length - 1].date;
                const oldestDateTimestamp = new Date(oldestDateStr).getTime();

                // Buscamos el activo que tiene menos historia (su fecha de inicio es más grande)
                if (oldestDateTimestamp > latestStartDate) {
                    latestStartDate = oldestDateTimestamp;
                    driverSymbol = holding.symbol;
                }
            }
        });

        if (!driverSymbol || !availableDatesPerAsset[driverSymbol]) return [];

        // Usamos las fechas del driverSymbol (el de historia más corta) como eje maestro.
        // Filtramos solo las fechas >= latestStartDate para estar seguros (aunque por definición deberían serlo).
        // Y como sortedHistory está DESC, el result también será DESC.
        const masterTimeline = availableDatesPerAsset[driverSymbol]
            .filter(date => new Date(date).getTime() >= latestStartDate);

        const aggregated: AssetHistorical[] = [];

        // Iterar fechas
        for (const date of masterTimeline) {
            let totalValue = 0;
            let isValidPoint = true;

            for (const h of holdings) {
                const price = historyMap[h.symbol]?.get(date);

                if (price === undefined) {
                    // Si falta dato, invalidamos el punto.
                    // (Podríamos implementar interpolación o usar dato anterior aquí, pero Buy&Hold estricto requiere precio conocido)
                    isValidPoint = false;
                    break;
                }
                totalValue += h.quantity * price;
            }

            if (isValidPoint) {
                aggregated.push({
                    symbol: 'PORTFOLIO',
                    date: date,
                    close: totalValue,
                    open: totalValue, // Aproximación
                    high: totalValue,
                    low: totalValue,
                    volume: 0,
                    change: 0,
                    changePercent: 0,
                    vwap: totalValue
                });
            }
        }

        // Retornar ordenado ASC (Antiguo a Reciente) para los gráficos
        const sortedAggregated = aggregated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedAggregated;

    }, [queries, holdings, isLoading, isError]);

    // 3. Calcular métricas sobre la serie agregada
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