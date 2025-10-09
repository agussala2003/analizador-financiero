// src/services/data/assetProcessor.ts

import { AssetData, RawApiData, HistoricalHolding, RevenueSegment, AssetRating } from '../../types/dashboard';
import { indicatorConfig } from '../../utils/financial';
import { getFirstPresent, findCloseByDate, computeSharpe, computeStdDevPct } from '../../utils/financial-formulas';

/**
 * Procesa los datos crudos de la API y los transforma en una estructura AssetData limpia y completa.
 * @param raw - Objeto con todos los datos com binados de las diferentes llamadas a la API.
 * @param historicalData - Array de datos históricos del precio.
 * @param revenueData - Objeto con los datos de segmentación de ingresos.
 * @param ratingData - Array con los datos de calificación del activo.
 * @returns {AssetData} - El objeto AssetData procesado y listo para la UI.
 */
export function processAssetData(
    raw: RawApiData,
    historicalData: any, // La API puede devolver un array o un objeto { historical: [] }
    revenueData: { geo: any; prod: any },
    ratingData: any[]
): AssetData {

    // 1. Transformar datos de segmentación de ingresos
    const geoRevenue: RevenueSegment[] = revenueData.geo?.[0]?.data
        ? Object.entries(revenueData.geo[0].data).map(([name, value]) => ({ name: name.replace('Segment', '').trim(), value: value as number }))
        : [];
    const prodRevenue: RevenueSegment[] = revenueData.prod?.[0]?.data
        ? Object.entries(revenueData.prod[0].data).map(([name, value]) => ({ name: name.trim(), value: value as number }))
        : [];

    // 2. Inicializar el objeto AssetData con datos básicos del perfil y la cotización
    const processed: AssetData = {
        symbol: raw.symbol,
        companyName: raw.companyName,
        currency: raw.currency,
        exchangeFullName: raw.exchangeFullName,
        industry: raw.industry,
        website: raw.website,
        description: raw.description,
        ceo: raw.ceo,
        sector: raw.sector,
        country: raw.country,
        employees: raw.fullTimeEmployees,
        image: raw.image,
        marketCap: Number(raw.marketCap),
        lastDividend: Number(raw.lastDividend),
        averageVolume: Number(raw.averageVolume),
        lastMonthAvgPriceTarget: Number(raw.lastMonthAvgPriceTarget),
        range: raw.range,
        volume: Number(raw.volume),
        beta: Number(raw.beta),
        data: {},
        historicalReturns: [],
        historicalRaw: [],
        currentPrice: Number(raw.price),
        dayChange: Number(raw.changePercentage),
        weekChange: 'N/A', monthChange: 'N/A', quarterChange: 'N/A', yearChange: 'N/A', ytdChange: 'N/A',
        stdDev: 'N/A', sharpeRatio: 'N/A',
        dcf: typeof raw.equityValuePerShare === 'number' ? raw.equityValuePerShare : 'N/A',
        rating: ratingData[0] ? { ...(ratingData[0] as AssetRating) } : null,
        geographicRevenue: geoRevenue,
        productRevenue: prodRevenue,
    };

    // 3. Procesar y calcular todos los indicadores fundamentales
    Object.keys(indicatorConfig).forEach((key: string) => {
        const cfg = indicatorConfig[key as keyof typeof indicatorConfig];
        let val: number | null = getFirstPresent(raw, cfg.apiFields);

        if ((val === null || val === undefined) && 'compute' in cfg && typeof cfg.compute === 'function') {
            const computed = cfg.compute(raw);
            if (computed !== null && Number.isFinite(computed)) val = computed;
        }

        if ('asPercent' in cfg && cfg.asPercent && typeof val === 'number') val = val * 100;

        processed.data[key] = (typeof val === 'number' && Number.isFinite(val)) ? val : 'N/A';
    });

    // 4. Procesar datos históricos y calcular métricas de rendimiento y técnicas
    const histArray = Array.isArray(historicalData) ? historicalData : (historicalData?.historical ?? []);
    const historyAsc = histArray
        .filter((d: any): d is HistoricalHolding => d && d.date && d.close != null)
        .map((d: any) => ({ ...d, close: Number(d.close) }))
        .sort((a: HistoricalHolding, b: HistoricalHolding) => new Date(a.date).getTime() - new Date(b.date).getTime());

    processed.historicalRaw = historyAsc;

    if (historyAsc.length > 1) {
        // Calcular retornos diarios para análisis estadístico
        for (let i = 1; i < historyAsc.length; i++) {
            const prev = historyAsc[i - 1].close;
            const curr = historyAsc[i].close;
            if (prev > 0) {
                processed.historicalReturns.push(curr / prev - 1);
            }
        }

        const latest = historyAsc[historyAsc.length - 1];
        const latestPrice = latest.close;

        // Calcular cambios de período (semana, mes, etc.)
        const periods = {
            weekChange: 7,
            monthChange: 30,
            quarterChange: 90,
            yearChange: 365,
        };

        for (const [key, days] of Object.entries(periods)) {
            const d = new Date(latest.date);
            d.setDate(d.getDate() - days);
            const p = findCloseByDate(historyAsc, d.toISOString().slice(0, 10));
            if (p && p > 0) {
                (processed as any)[key] = ((latestPrice / p) - 1) * 100;
            }
        }
        
        // Calcular YTD (Year-to-Date)
        const startYear = new Date(latest.date);
        startYear.setMonth(0, 1);
        const pYtd = findCloseByDate(historyAsc, startYear.toISOString().slice(0, 10));
        if (pYtd && pYtd > 0) {
            processed.ytdChange = ((latestPrice / pYtd) - 1) * 100;
        }

        // Calcular Sharpe Ratio y Desviación Estándar
        const sharpeVal = computeSharpe(processed.historicalReturns);
        if (sharpeVal !== null) processed.sharpeRatio = sharpeVal;

        const sdPct = computeStdDevPct(processed.historicalReturns.slice(-30));
        if (sdPct !== null) processed.stdDev = sdPct;

        // Calcular Indicadores Técnicos (SMA, RSI, etc.)
        calculateTechnicalIndicators(processed, historyAsc);
    }

    return processed;
}


/**
 * Calcula y asigna los indicadores técnicos (SMA, RSI, etc.) al objeto AssetData.
 * Esta función modifica el objeto `asset` directamente (por referencia).
 * @param asset - El objeto AssetData a modificar.
 * @param historyAsc - El historial de precios ordenado ascendentemente.
 */
function calculateTechnicalIndicators(asset: AssetData, historyAsc: HistoricalHolding[]) {
    const closes = historyAsc.map(d => d.close);

    // RSI(14)
    const w = 14;
    if (closes.length >= w + 1) {
        let gains = 0, losses = 0;
        for (let i = closes.length - w; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff >= 0) gains += diff; else losses -= diff;
        }
        const avgGain = gains / w;
        const avgLoss = losses / w;
        asset.data.rsi14 = avgLoss > 0 ? 100 - (100 / (1 + (avgGain / avgLoss))) : 100;
    }

    // Simple Moving Average (SMA)
    const sma = (period: number) => {
        if (closes.length < period) return null;
        return closes.slice(-period).reduce((a, b) => a + b, 0) / period;
    };
    
    const sma50 = sma(50);
    const sma200 = sma(200);

    if (sma50) asset.data.sma50 = sma50;
    if (sma200) asset.data.sma200 = sma200;
    if (sma50 && sma200) {
        asset.data.smaSignal = sma50 > sma200 ? 1 : 0;
    }

    // Distancia a máximo/mínimo de 52 semanas
    const lastPrice = closes[closes.length - 1];
    const period52w = historyAsc.slice(-252); // Aproximadamente 252 días de trading en un año
    if (period52w.length > 0) {
        const windowCloses = period52w.map(d => d.close);
        const hi = Math.max(...windowCloses);
        const lo = Math.min(...windowCloses);
        if (hi > 0) asset.data.dist52wHigh = ((hi - lastPrice) / hi) * 100;
        if (lo > 0) asset.data.dist52wLow = ((lastPrice - lo) / lo) * 100;
    }
}