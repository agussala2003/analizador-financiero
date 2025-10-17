// src/services/api/asset-api.ts

import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { processAssetData } from '../data/asset-processor';
import type { AssetData, RawApiData } from '../../types/dashboard';
import type { Config } from '../../types/config';
import type { Profile } from '../../types/auth';
import type { User } from '@supabase/supabase-js';
import { hasApiCallsAvailable, incrementApiCallCounter } from './apiLimiter';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

// Tipos auxiliares que estaban en tu provider
type FmpArray<T = Record<string, unknown>> = T[];
type HistoricalDataResponse = Parameters<typeof processAssetData>[1];
type RevenueApiResponse = Parameters<typeof processAssetData>[2];

/**
 * Busca los datos completos de un activo desde la API (vía proxy),
 * los procesa y los cachea en Supabase.
 * 
 * LÓGICA DE CACHÉ MEJORADA:
 * - Cache < 2h: Devuelve inmediatamente (fresco)
 * - Cache 2h-24h + API disponible: Intenta refresh, fallback a cache
 * - Cache 2h-24h + Sin API: Devuelve cache con aviso
 * - Cache > 24h + Sin API: Error (cache muy antiguo)
 * 
 * @param queryKey - Objeto de React Query que contiene el ticker y otros datos.
 * @param fromPortfolio - Si viene del portafolio, usa solo caché sin contar API call
 * @returns {Promise<AssetData>} - Los datos del activo procesados.
 */
export async function fetchTickerData({
    queryKey,
    fromPortfolio = false,
}: {
    queryKey: [string, string, Config, User | null, Profile | null];
    fromPortfolio?: boolean;
}): Promise<AssetData> {
    const [, ticker, config, user, profile] = queryKey;

    // 1. Consultar caché de Supabase
    const { data: cached } = await supabase
        .from('asset_data_cache')
        .select('data, last_updated_at')
        .eq('symbol', ticker)
        .single();

    // Definir umbrales de frescura
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. ✅ Cache fresco (< 2 horas) - Devolver inmediatamente
    if (cached && new Date(cached.last_updated_at as string) > twoHoursAgo) {
        return cached.data as AssetData;
    }

    // 3. ✅ Del portafolio con cache < 24h - Usar cache sin consumir API
    if (fromPortfolio && cached?.data) {
        const cacheDate = new Date(cached.last_updated_at as string);
        if (cacheDate > oneDayAgo) {
            toast.info(`Datos del portafolio (${formatDate(cacheDate)})`, { duration: 2000 });
            return cached.data as AssetData;
        }
        // Si el cache del portfolio tiene > 24h, intentamos refresh normal
    }

    // 4. ✅ Verificar disponibilidad de API (SIN consumir todavía)
    const hasApiAvailable = await hasApiCallsAvailable(user, profile, config);

    if (!hasApiAvailable) {
        // Si hay cache < 24h, usarlo aunque esté desactualizado
        if (cached?.data && new Date(cached.last_updated_at as string) > oneDayAgo) {
            toast.warning(`Límite de API alcanzado. Datos del ${formatDate(cached.last_updated_at as string)}.`);
            return cached.data as AssetData;
        }
        
        // Cache muy antiguo o inexistente
        toast.error('Límite de API alcanzado y sin datos recientes en caché.', {
            description: 'Actualiza tu plan para obtener más acceso.'
        });
        throw new Error('Límite de API alcanzado sin datos en caché disponibles.');
    }

    // 5. ✅ Intentar fetch desde API

    const { fmpProxyEndpoints } = config.api;
    const endpoints = [
        fmpProxyEndpoints.profile, fmpProxyEndpoints.keyMetrics, fmpProxyEndpoints.quote,
        fmpProxyEndpoints.historical, fmpProxyEndpoints.priceTarget, fmpProxyEndpoints.dcf,
        fmpProxyEndpoints.rating, fmpProxyEndpoints.revenueGeographic, fmpProxyEndpoints.revenueProduct,
    ];

    try {
        // Crear promesas con timeout de 15 segundos
        const promises = endpoints.map(path =>
            Promise.race([
                supabase.functions.invoke('fmp-proxy', { body: { endpointPath: `${path}?symbol=${ticker}` } }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout - el servidor tardó demasiado en responder')), 15000)
                )
            ])
        );
        const results = await Promise.all(promises);

        // Verificar errores con type guard
        for (const result of results) {
            if (result && typeof result === 'object' && 'error' in result && result.error) {
                throw result.error;
            }
        }

        const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes, dcfRes, ratingRes, geoRes, prodRes] = results.map(r => 
            (r && typeof r === 'object' && 'data' in r) ? r.data as unknown : undefined
        );

        if (!Array.isArray(profileRes) || profileRes.length === 0) {
            throw new Error(`El símbolo "${ticker}" no fue encontrado. Verifica que sea correcto.`);
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

        // ✅ SOLO AHORA incrementar contador (fetch exitoso)
        if (user?.id) {
            await incrementApiCallCounter(user.id);
        }

        // Actualizar cache con datos frescos
        await supabase.from('asset_data_cache').upsert({
            symbol: ticker,
            data: processed,
            last_updated_at: new Date().toISOString()
        });

        return processed;

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al consultar datos del activo.';
        void logger.error('API_FETCH_FAILED', `Failed to fetch data for ${ticker}`, { ticker, errorMessage: msg });
        
        // Fallback a cache si existe (aunque esté desactualizado)
        if (cached?.data) {
            toast.warning(`No se pudo actualizar ${ticker}. Mostrando última versión disponible (${formatDate(cached.last_updated_at as string)}).`);
            return cached.data as AssetData;
        }

        // Sin cache disponible, propagar error
        throw new Error(msg);
    }
}