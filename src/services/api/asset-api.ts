// src/services/api/asset-api.ts

import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { processAssetData } from '../data/asset-processor';
import type { AssetData } from '../../types/dashboard';
import type { Config } from '../../types/config';
import type { Profile } from '../../types/auth';
import type { User } from '@supabase/supabase-js';
import { hasApiCallsAvailable, incrementApiCallCounter } from './apiLimiter';
import { toast } from 'sonner';

/**
 * Helper para crear promesas de request con timeout.
 */
function makeRequest(path: string, ticker: string, extraParams = '') {
    return Promise.race([
        supabase.functions.invoke('fmp-proxy', {
            body: { endpointPath: `${path}?symbol=${ticker}${extraParams}` }
        }),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout - el servidor tardó demasiado en responder')), 20000)
        )
    ]);
}

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

    const oneHourAgo = new Date(Date.now() - 1 * 60 * 1000); // 1 minuto de frescura

    if (!forceRefresh && cached && new Date(cached.last_updated_at as string) > oneHourAgo) {
        return cached.data as AssetData;
    }

    if (forceRefresh && cached && new Date(cached.last_updated_at as string) > oneHourAgo) {
        toast.info(`Forzando actualización de ${ticker}...`, { duration: 2000 });
    }

    // 2. Verificar límites de API
    const hasApiAvailable = await hasApiCallsAvailable(user, profile, config);

    if (!hasApiAvailable) {
        if (cached?.data) {
            const cacheDate = new Date(cached.last_updated_at as string);
            const hoursOld = Math.floor((Date.now() - cacheDate.getTime()) / (1000 * 60 * 60));
            toast.warning(`Límite de API alcanzado. Usando datos de hace ${hoursOld}h.`);
            return cached.data as AssetData;
        }
        toast.error('Límite de API alcanzado y sin datos en caché.');
        throw new Error('Límite de API alcanzado sin datos en caché disponibles.');
    }

    // 3. Preparar endpoints
    const { fmpProxyEndpoints } = config.api;

    // Endpoints estándar (sin parámetros extra)
    // Nota: Asegúrate de que las claves existan en tu config.ts, si no usa strings fallback
    const endpointsGroup1 = [
        fmpProxyEndpoints.profile,              // 0
        fmpProxyEndpoints.keyMetrics,           // 1
        fmpProxyEndpoints.quote,                // 2
        fmpProxyEndpoints.historical,           // 3
        fmpProxyEndpoints.priceTarget,          // 4
        fmpProxyEndpoints.dcf,                  // 5
        fmpProxyEndpoints.rating,               // 6
        fmpProxyEndpoints.revenueGeographic,    // 7
        fmpProxyEndpoints.revenueProduct,       // 8
        fmpProxyEndpoints.priceTargetConsensus, // 9
        fmpProxyEndpoints.gradesConsensus || 'grade', // 10
    ];

    // Endpoints grupo 2 (después de estimates)
    const endpointsGroup2 = [
        fmpProxyEndpoints.ratios, // 12
        fmpProxyEndpoints.keyMetricsYear, // 13 (asumiendo anual)
        fmpProxyEndpoints.leveredDiscountedCashFlow, // 14
        fmpProxyEndpoints.stockPriceChange // 15
    ];

    try {
        // Construimos el array de promesas en el orden exacto que espera el destructuring
        const promises = [
            ...endpointsGroup1.map(path => makeRequest(path, ticker)),

            // 11. Analyst Estimates (Con parámetros personalizados)
            makeRequest(
                fmpProxyEndpoints.analystEstimates || 'analyst-estimates',
                ticker,
                '&period=annual&limit=10'
            ),

            ...endpointsGroup2.map(path => makeRequest(path, ticker))
        ];

        const results = await Promise.all(promises);

        // Verificar errores
        for (const result of results) {
            if (result && typeof result === 'object' && 'error' in result && result.error) {
                console.error(`Error fetching endpoint for ${ticker}:`, result.error);
                throw result.error;
            }
        }

        // Extraer datos (mapeando a undefined si falló algo específico pero no lanzó error)
        const allData = results.map(r => (r && typeof r === 'object' && 'data' in r) ? r.data : undefined);

        const [
            profileRes,             // 0
            keyMetricsRes,          // 1
            quoteRes,               // 2
            historicalRes,          // 3
            priceTargetRes,         // 4
            dcfRes,                 // 5
            ratingRes,              // 6
            geoRes,                 // 7
            prodRes,                // 8
            consensusRes,           // 9
            gradesConsensusRes,     // 10
            analystEstimatesRes,    // 11 (Ahora está en la posición correcta)
            ratiosRes,              // 12
            keyMetricsYearRes,      // 13
            leveredDiscountedCashFlowRes, // 14
            stockPriceChangeRes     // 15
        ] = allData;

        // Procesar datos
        // Nota: Asegúrate de que tu función processAssetData en asset-processor.ts 
        // acepte todos estos argumentos.
        const processed = processAssetData(
            ticker,
            profileRes,
            keyMetricsRes,
            quoteRes,
            historicalRes,
            priceTargetRes,
            dcfRes,
            ratingRes,
            geoRes,
            prodRes,
            consensusRes,
            // Nuevos argumentos
            gradesConsensusRes,
            analystEstimatesRes,
            ratiosRes,
            keyMetricsYearRes,
            leveredDiscountedCashFlowRes,
            stockPriceChangeRes
        );
        console.log(processed);

        // Incrementar contador
        if (user?.id) {
            await incrementApiCallCounter(user.id);
        }

        // Actualizar caché
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
            const cacheDate = new Date(cached.last_updated_at as string);
            const hoursOld = Math.floor((Date.now() - cacheDate.getTime()) / (1000 * 60 * 60));
            toast.warning(`No se pudo actualizar ${ticker}. Usando datos de hace ${hoursOld}h.`);
            return cached.data as AssetData;
        }

        toast.error(`Error al cargar ${ticker}`, { description: msg });
        throw new Error(msg);
    }
}