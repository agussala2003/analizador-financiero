// src/utils/financial-data-resolver.ts

import { AssetData } from "../types/dashboard";
import { indicatorConfig } from "./financial";

/**
 * Resuelve el valor de un indicador financiero buscando en todas las capas de datos del activo.
 * Sigue la jerarquía: API Fields (Ratios > KeyMetrics > Quote > Profile) -> Compute.
 * * @param asset - El objeto con los datos del activo.
 * @param key - La clave del indicador (ej: 'priceToEarnings', 'roe', 'debtToEquity').
 * @returns El valor numérico o null si no se encuentra.
 */
export function resolveAssetMetric(asset: AssetData, key: string): number | null {
    if (!asset) return null;

    // 1. Caso Especial: Potencial de subida (Calculado vs Consenso)
    if (key === 'upsidePotential') {
        const p = asset.quote?.price;
        const t = asset.priceTargetConsensus?.targetConsensus;
        return (p && t && p > 0) ? (t - p) / p : null;
    }

    // 2. Mapeos directos para claves comunes que pueden tener nombres distintos en la API
    // A veces la API devuelve 'pe' en lugar de 'priceToEarnings' en ciertos endpoints
    const keyMap: Record<string, string[]> = {
        'PER': ['pe', 'peRatio', 'priceToEarningsRatioTTM', 'priceToEarnings'],
        'roe': ['returnOnEquity', 'returnOnEquityTTM'],
        'roa': ['returnOnAssets', 'returnOnAssetsTTM'],
        'debtToEquity': ['debtEquityRatio', 'debtToEquityTTM', 'debtToEquity'],
        'priceToBook': ['pbRatio', 'priceToBookRatioTTM', 'priceToBook'],
        'currentRatio': ['currentRatioTTM', 'currentRatio'],
        'quickRatio': ['quickRatioTTM', 'quickRatio'],
        'payout_ratio': ['payoutRatioTTM', 'payoutRatio'],
        'operatingMargin': ['operatingProfitMarginTTM', 'operatingProfitMargin'],
        'netProfitMargin': ['netProfitMarginTTM', 'netProfitMargin'],
        'grossMargin': ['grossProfitMarginTTM', 'grossProfitMargin']
    };

    // Claves posibles a buscar (la clave original + alias)
    const searchKeys = [key, ...(keyMap[key] || [])];

    // 3. Fuentes de datos donde buscar (en orden de prioridad/frescura)
    // Ratios TTM (Trailing Twelve Months) suelen ser lo más preciso para análisis
    const sources = [
        // Ratios suele venir como array, tomamos el primero (más reciente)
        Array.isArray(asset.ratios) ? asset.ratios[0] : asset.ratios,
        // KeyMetrics puede ser objeto o array
        Array.isArray(asset.keyMetrics) ? asset.keyMetrics[0] : asset.keyMetrics,
        // Datos en tiempo real
        asset.quote,
        // Perfil estático
        asset.profile,
        // Rating score
        asset.rating
    ];

    // 4. Búsqueda Iterativa
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;

        for (const searchKey of searchKeys) {
            if (searchKey in source) {
                const val = (source)[searchKey];
                if (typeof val === 'number' && Number.isFinite(val)) {
                    return val;
                }
            }
        }
    }

    // 5. Fallback: Cálculo manual definido en indicatorConfig (si existe)
    const config = indicatorConfig[key];
    if (config?.compute) {
        // Preparamos un contexto plano con lo que tenemos para que la función compute pueda trabajar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawContext: any = {
            ...(asset.quote as any), // eslint-disable-line @typescript-eslint/no-explicit-any
            ...(asset.profile as any), // eslint-disable-line @typescript-eslint/no-explicit-any
            ...(Array.isArray(asset.keyMetrics) ? asset.keyMetrics[0] : asset.keyMetrics as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        const computed = config.compute(rawContext);
        if (computed !== null && Number.isFinite(computed)) return computed;
    }

    return null;
}