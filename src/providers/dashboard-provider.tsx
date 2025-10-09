// src/providers/dashboard-provider.tsx

import React, { useCallback, useState, useMemo, createContext } from "react";
import { useAuth } from "../hooks/use-auth";
import { useConfig } from "../hooks/use-config";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { logger } from "../lib/logger";

// Importaciones de tipos desde sus archivos individuales
import { DashboardContextType, AssetData, RawApiData } from "../types/dashboard";

// Lógica de negocio modularizada
import { checkApiLimit } from "../services/api/apiLimiter";
import { processAssetData } from "../services/data/assetProcessor";
import { indicatorConfig } from "../utils/financial";

// Tipos auxiliares para respuestas FMP estrechadas mínimamente
type FmpArray<T = Record<string, unknown>> = T[];

// Importar el tipo correcto desde assetProcessor
type HistoricalDataResponse = Parameters<typeof processAssetData>[1];
type RevenueApiResponse = Parameters<typeof processAssetData>[2];

// ✅ Mejora: Contexto con guard que lanza si se usa fuera del Provider
// eslint-disable-next-line react-refresh/only-export-components
export const DashboardContext = createContext<DashboardContextType>(new Proxy({}, {
    get: () => {
        throw new Error('useDashboard debe ser utilizado dentro de un DashboardProvider');
    }
}) as DashboardContextType);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const config = useConfig();
    
    const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
    const [assetsData, setAssetsData] = useState<Record<string, AssetData>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const showError = useCallback((message: string, options?: { detail?: string }) => {
        setError(message);
        toast.error(message, { description: options?.detail });
    }, []);

    const fetchTickerData = useCallback(async (ticker: string): Promise<AssetData | null> => {
        if (!await checkApiLimit(user, profile, config)) return null;

        const { fmpProxyEndpoints } = config.api;
        const endpoints = [
            fmpProxyEndpoints.profile, fmpProxyEndpoints.keyMetrics, fmpProxyEndpoints.quote,
            fmpProxyEndpoints.historical, fmpProxyEndpoints.priceTarget, fmpProxyEndpoints.dcf,
            fmpProxyEndpoints.rating, fmpProxyEndpoints.revenueGeographic, fmpProxyEndpoints.revenueProduct,
        ];

        try {
            const promises = endpoints.map(path =>
                supabase.functions.invoke('fmp-proxy', { body: { endpointPath: `${path}?symbol=${ticker}` } })
            );
            const results = await Promise.all(promises);

            for (const result of results) if (result.error) throw result.error;
            
            const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes, dcfRes, ratingRes, geoRes, prodRes] = results.map(r => r.data as unknown);

            if (!Array.isArray(profileRes) || profileRes.length === 0) throw new Error('Ticker no encontrado.');
            
                                    const raw: RawApiData = {
                                        ...(Array.isArray(profileRes) ? (profileRes as FmpArray)[0] : {}),
                                        ...(Array.isArray(keyMetricsRes) ? (keyMetricsRes as FmpArray)[0] : {}),
                                        ...(Array.isArray(quoteRes) ? (quoteRes as FmpArray)[0] : {}),
                                        ...(Array.isArray(priceTargetRes) ? (priceTargetRes as FmpArray)[0] : {}),
                                        ...(Array.isArray(dcfRes) ? (dcfRes as FmpArray)[0] : {}),
                                    } as RawApiData;

                                    const processed = processAssetData(
                                        raw,
                                        historicalRes as HistoricalDataResponse,
                                        { 
                                            geo: Array.isArray(geoRes) ? geoRes : [], 
                                            prod: Array.isArray(prodRes) ? prodRes : [] 
                                        } as RevenueApiResponse,
                                        (Array.isArray(ratingRes) ? ratingRes : []) as unknown[]
                                    );
            
            await supabase.from('asset_data_cache').upsert({ 
                symbol: ticker, 
                data: processed, 
                last_updated_at: new Date().toISOString() 
            });

            return processed;

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error al consultar datos del activo.';
            void logger.error('API_FETCH_FAILED', `Failed to fetch data for ${ticker}`, { ticker, errorMessage: msg });
            showError('No pudimos traer los datos del activo.', { detail: msg });
            return null;
        }
    }, [user, profile, config, showError]);

    const addTicker = useCallback(async (tickerRaw: string, options: { fromPortfolio?: boolean; addToSelected?: boolean } = {}) => {
        const { fromPortfolio = false, addToSelected = true } = options;
        const ticker = tickerRaw.trim().toUpperCase();
        if (!ticker) return;

        if (addToSelected && selectedTickers.includes(ticker)) {
            if (!fromPortfolio) showError('Este activo ya ha sido añadido.');
            return;
        }
        
    const role = profile?.role ?? 'basico';
        if (role === 'basico' && !config.plans.freeTierSymbols.includes(ticker)) {
            if (!fromPortfolio) showError(`El símbolo ${ticker} no está disponible en el plan Básico.`);
            return;
        }
        
        if (addToSelected && !fromPortfolio) {
            setError('');
            const maxTickers = config.dashboard.maxTickersToCompare[role as keyof typeof config.dashboard.maxTickersToCompare] || 2;
            if (selectedTickers.length >= maxTickers) {
                showError(`Puedes comparar hasta ${maxTickers} activos a la vez.`);
                return;
            }
        }
        
        setLoading(true);
        try {
            const { data: cached } = await supabase
                .from('asset_data_cache').select('data, last_updated_at').eq('symbol', ticker).single();
    
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            let assetData: AssetData | null = null;
    
            if (cached && new Date(cached.last_updated_at as unknown as string) > oneHourAgo) {
                assetData = cached.data as unknown as AssetData;
            } else {
                assetData = await fetchTickerData(ticker);
                if (!assetData && cached) {
                    assetData = cached.data as unknown as AssetData;
                    showError(`No se pudieron actualizar los datos para ${ticker}. Mostrando la última versión disponible.`);
                }
            }
    
            if (assetData) {
                setAssetsData(prev => ({ ...prev, [ticker]: assetData }));
                if (addToSelected) {
                    setSelectedTickers(prev => [...prev, ticker]);
                }
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Error inesperado';
            showError('Ocurrió un error inesperado al agregar el activo.', { detail: msg });
        } finally {
            setLoading(false);
        }
    }, [config, profile?.role, selectedTickers, showError, fetchTickerData]);

    const removeTicker = useCallback((ticker: string) => {
        setSelectedTickers(prev => prev.filter(t => t !== ticker));
        setAssetsData(prev => {
            const newState = { ...prev };
            delete newState[ticker];
            return newState;
        });
    }, []);

    const value = useMemo(
        (): DashboardContextType => ({
            indicatorConfig, selectedTickers, assetsData,
            addTicker, removeTicker, loading, error,
        }),
        [selectedTickers, assetsData, loading, error, addTicker, removeTicker]
    );

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}