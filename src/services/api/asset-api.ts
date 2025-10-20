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

// Tipos auxiliares que estaban en tu provider
type FmpArray<T = Record<string, unknown>> = T[];
type HistoricalDataResponse = Parameters<typeof processAssetData>[1];
type RevenueApiResponse = Parameters<typeof processAssetData>[2];

/**
 * Busca los datos completos de un activo desde la API (vía proxy),
 * los procesa y los cachea en Supabase.
 * 
 * LÓGICA DE CACHÉ SIMPLIFICADA:
 * - Cache < 1h: Devuelve inmediatamente (fresco) SIN llamar a la API
 * - Cache > 1h: SIEMPRE intenta actualizar desde la API
 *   - Si API disponible: Fetch y actualiza
 *   - Si API no disponible o falla: Fallback al cache antiguo
 * - forceRefresh = true: Ignora cache y SIEMPRE actualiza (para botón manual)
 * 
 * @param queryKey - Objeto de React Query que contiene el ticker y otros datos.
 * @param forceRefresh - Si es true, ignora el cache y fuerza actualización desde API
 * @returns {Promise<AssetData>} - Los datos del activo procesados.
 */
export async function fetchTickerData({
    queryKey,
    forceRefresh = false,
}: {
    queryKey: [string, string, Config, User | null, Profile | null];
    forceRefresh?: boolean;
}): Promise<AssetData> {
    const [, ticker, config, user, profile] = queryKey;

    // 1. Consultar caché de Supabase
    const { data: cached } = await supabase
        .from('asset_data_cache')
        .select('data, last_updated_at')
        .eq('symbol', ticker)
        .single();

    // Definir umbral de frescura: 1 hora
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

    // 2. ✅ Cache fresco (< 1 hora) - Devolver inmediatamente SIN llamar a la API
    // EXCEPCIÓN: Si forceRefresh = true, continuar a actualizar
    if (!forceRefresh && cached && new Date(cached.last_updated_at as string) > oneHourAgo) {
        return cached.data as AssetData;
    }

        // Si llegamos aquí con forceRefresh, informar al usuario
        if (forceRefresh && cached && new Date(cached.last_updated_at as string) > oneHourAgo) {
            toast.info(`Forzando actualización de ${ticker}...`, { duration: 2000 });
        }

        // 3. ✅ Cache > 1 hora (o forceRefresh) - SIEMPRE intentar actualizar desde la API
    
    // 3.1. Verificar disponibilidad de API antes de intentar fetch
    const hasApiAvailable = await hasApiCallsAvailable(user, profile, config);

    if (!hasApiAvailable) {
        // Sin API disponible - Usar cache como fallback (si existe)
        if (cached?.data) {
            const cacheDate = new Date(cached.last_updated_at as string);
            const hoursOld = Math.floor((Date.now() - cacheDate.getTime()) / (1000 * 60 * 60));
            toast.warning(`Límite de API alcanzado. Usando datos de hace ${hoursOld}h.`);
            return cached.data as AssetData;
        }
        
        // Sin cache disponible - Error
        toast.error('Límite de API alcanzado y sin datos en caché.', {
            description: 'Actualiza tu plan para obtener más acceso.'
        });
        throw new Error('Límite de API alcanzado sin datos en caché disponibles.');
    }

    // 3.2. ✅ API disponible - Intentar fetch

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
        
        // 3.3. ✅ Fetch falló - Fallback a cache si existe
        if (cached?.data) {
            const cacheDate = new Date(cached.last_updated_at as string);
            const hoursOld = Math.floor((Date.now() - cacheDate.getTime()) / (1000 * 60 * 60));
            toast.warning(`No se pudo actualizar ${ticker}. Usando datos de hace ${hoursOld}h.`);
            return cached.data as AssetData;
        }

        // Sin cache disponible - Propagar error
        toast.error(`Error al cargar ${ticker}`, { description: msg });
        throw new Error(msg);
    }
}