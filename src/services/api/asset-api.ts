// src/services/api/asset-api.ts

import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { processAssetData } from '../data/asset-processor';
import type { AssetData, RawApiData } from '../../types/dashboard';
import type { Config } from '../../types/config';
import type { Profile } from '../../types/auth';
import type { User } from '@supabase/supabase-js';
import { checkApiLimit } from './apiLimiter';
import { toast } from 'sonner';

// Tipos auxiliares que estaban en tu provider
type FmpArray<T = Record<string, unknown>> = T[];
type HistoricalDataResponse = Parameters<typeof processAssetData>[1];
type RevenueApiResponse = Parameters<typeof processAssetData>[2];

/**
 * Busca los datos completos de un activo desde la API (vía proxy),
 * los procesa y los cachea en Supabase.
 * @param queryKey - Objeto de React Query que contiene el ticker y otros datos.
 * @returns {Promise<AssetData>} - Los datos del activo procesados.
 */
export async function fetchTickerData({
    queryKey,
}: {
    queryKey: [string, string, Config, User | null, Profile | null];
}): Promise<AssetData> {
    const [, ticker, config, user, profile] = queryKey;

    // 1. Primero, revisamos la caché de Supabase
    const { data: cached } = await supabase
        .from('asset_data_cache')
        .select('data, last_updated_at')
        .eq('symbol', ticker)
        .single();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (cached && new Date(cached.last_updated_at as string) > oneHourAgo) {
        return cached.data as AssetData;
    }

    // 2. Si no hay caché o está desactualizada, vamos a la API
    if (!await checkApiLimit(user, profile, config)) {
        if (cached?.data) {
            toast.warning(`Límite de API alcanzado. Mostrando datos cacheados para ${ticker}.`);
            return cached.data as AssetData;
        }
        throw new Error('Límite de llamadas a la API alcanzado.');
    }

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

        for (const result of results) {
            if (result.error) throw result.error;
        }

        const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes, dcfRes, ratingRes, geoRes, prodRes] = results.map(r => r.data as unknown);

        if (!Array.isArray(profileRes) || profileRes.length === 0) {
            throw new Error(`Ticker "${ticker}" no encontrado.`);
        }

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
        
        if (cached?.data) {
            // toast.warning(`No se pudieron actualizar los datos para ${ticker}. Mostrando la última versión disponible.`);
            return cached.data as AssetData;
        }

        throw new Error(msg);
    }
}