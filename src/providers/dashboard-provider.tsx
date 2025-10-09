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

const initialState: DashboardContextType = {
    selectedTickers: [],
    assetsData: {},
    loading: false,
    error: '',
    addTicker: () => Promise.resolve(),
    removeTicker: () => {},
    indicatorConfig,
};

export const DashboardContext = createContext<DashboardContextType>(initialState);

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
            
            const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes, dcfRes, ratingRes, geoRes, prodRes] = results.map(r => r.data);

            if (!Array.isArray(profileRes) || profileRes.length === 0) throw new Error('Ticker no encontrado.');
            
            const raw: RawApiData = { ...profileRes[0], ...keyMetricsRes[0], ...quoteRes[0], ...priceTargetRes[0], ...dcfRes[0] };
            const processed = processAssetData(raw, historicalRes, { geo: geoRes, prod: prodRes }, ratingRes);
            
            await supabase.from('asset_data_cache').upsert({ 
                symbol: ticker, 
                data: processed, 
                last_updated_at: new Date().toISOString() 
            });

            return processed;

        } catch (e: any) {
            const msg = e?.message || 'Error al consultar datos del activo.';
            logger.error('API_FETCH_FAILED', `Failed to fetch data for ${ticker}`, { ticker, errorMessage: msg });
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
        
        const role = profile?.role || 'basico';
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
    
            if (cached && new Date(cached.last_updated_at) > oneHourAgo) {
                assetData = cached.data as AssetData;
            } else {
                assetData = await fetchTickerData(ticker);
                if (!assetData && cached) {
                    assetData = cached.data as AssetData;
                    showError(`No se pudieron actualizar los datos para ${ticker}. Mostrando la última versión disponible.`);
                }
            }
    
            if (assetData) {
                setAssetsData(prev => ({ ...prev, [ticker]: assetData! }));
                if (addToSelected) {
                    setSelectedTickers(prev => [...prev, ticker]);
                }
            }
        } catch (e: any) {
            showError('Ocurrió un error inesperado al agregar el activo.', { detail: e.message });
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