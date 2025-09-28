// src/providers/dashboard-provider.tsx

import React, { useCallback, useState, useMemo, createContext } from "react";
import { useAuth } from "../hooks/use-auth";
import { useConfig } from "../hooks/use-config";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { getFirstPresent, indicatorConfig, findCloseByDate, computeSharpe, Indicator, computeStdDevPct } from "../utils/financial";
import { DashboardContextType, RawApiData, AssetData, HistoricalHolding } from "../types/dashboard";
import { logger } from "../lib/logger";

// Creamos el contexto con el tipo definido y un valor inicial undefined.
export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
    const [assetsData, setAssetsData] = useState<Record<string, AssetData>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const config = useConfig();

    const showError = useCallback((message: string, options?: { detail?: string }) => {
        setError(message);
        toast.error(message, { description: options?.detail });
    }, []);

    const checkApiLimit = useCallback(async (): Promise<boolean> => {
        if (!user) return false;

        const today = new Date().toISOString().split('T')[0];
        const { data: prof, error: selErr } = await supabase.from('profiles').select('api_calls_made,last_api_call_date,role').eq('id', user.id).maybeSingle();

        if (selErr || !prof) {
            toast.error('No se pudo verificar el límite de uso de la API');
            return false;
        }

        const role = prof.role || profile?.role || 'basico';
        const limit = config.plans.roleLimits[role as keyof typeof config.plans.roleLimits] ?? config.plans.roleLimits.basico;

        let calls = prof.api_calls_made ?? 0;
        let lastDate = prof.last_api_call_date ?? null;

        if (lastDate !== today) {
            calls = 0;
            lastDate = today;
        }

        if (calls >= limit) {
            toast.info('Has alcanzado el límite diario de uso de la API. Actualiza tu plan para más acceso.');
            return false;
        }

        const { error: upErr } = await supabase.from('profiles').update({ api_calls_made: calls + 1, last_api_call_date: today }).eq('id', user.id);

        if (upErr) {
            toast.error('No se pudo actualizar el uso de la API');
            return false;
        }
        return true;
    }, [user, profile?.role, config.plans.roleLimits]);

    const fetchTickerData = useCallback(async (ticker: string): Promise<AssetData | null> => {
        const allowed = await checkApiLimit();
        if (!allowed) return null;

        const endpointTemplates = [
            config.api.fmpProxyEndpoints.profile,
            config.api.fmpProxyEndpoints.keyMetrics,
            config.api.fmpProxyEndpoints.quote,
            config.api.fmpProxyEndpoints.historical,
            config.api.fmpProxyEndpoints.priceTarget
        ];

        const endpoints = endpointTemplates.map(path => `${path}?symbol=${ticker}`);

        try {
            const promises = endpoints.map(endpointPath =>
                supabase.functions.invoke('fmp-proxy', {
                    body: { endpointPath }
                })
            );
            const results = await Promise.all(promises);

            for (const result of results) {
                if (result.error) throw result.error;
            }

            const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes] = results.map(result => result.data);

            if (!Array.isArray(profileRes) || profileRes.length === 0) throw new Error('Ticker no encontrado o respuesta inválida (profile).');
            if (!Array.isArray(keyMetricsRes)) throw new Error('Respuesta inválida (key-metrics-ttm).');
            if (!Array.isArray(quoteRes) || quoteRes.length === 0) throw new Error('Respuesta inválida (quote).');
            
            const companyProfile = profileRes[0] || {};
            if (companyProfile?.['Error Message']) throw new Error(companyProfile['Error Message']);
            
            const raw: RawApiData = { ...companyProfile, ...keyMetricsRes[0], ...quoteRes[0], ...priceTargetRes[0] };

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
                weekChange: 'N/A',
                monthChange: 'N/A',
                quarterChange: 'N/A',
                yearChange: 'N/A',
                ytdChange: 'N/A',
                stdDev: 'N/A',
                sharpeRatio: 'N/A',
            };

            Object.keys(indicatorConfig).forEach((key: string) => {
                const cfg: Indicator = indicatorConfig[key as keyof typeof indicatorConfig];
                const aliases = Array.isArray(cfg.apiFields) ? cfg.apiFields : [cfg.apiFields];
                let val: number | null = getFirstPresent(raw, aliases);

                if ((val === null || val === undefined) && typeof cfg.compute === 'function') {
                    const computed = cfg.compute(raw);
                    const num = Number(computed);
                    if (num !== null && Number.isFinite(num)) val = num;
                }

                const forcePercent = (cfg.asPercent ?? cfg.isPercentage) === true;
                if (forcePercent && typeof val === 'number') val = val * 100;

                processed.data[key] = (typeof val === 'number' && Number.isFinite(val)) ? val : 'N/A';
            });

           const histArray = Array.isArray(historicalRes) ? historicalRes : (historicalRes?.historical ?? []);
            
            const historyAsc = histArray
                .filter((d: any): d is HistoricalHolding => d && d.date && d.close !== null && d.close !== undefined)
                .map((d: any) => ({ ...d, close: Number(d.close) }))
                .sort((a: HistoricalHolding, b: HistoricalHolding) => new Date(a.date).getTime() - new Date(b.date).getTime());

            processed.historicalRaw = historyAsc;
            
                  if (historyAsc.length > 1) {
                    // Retornos diarios
                    for (let i = 1; i < historyAsc.length; i++) {
                      const prev = historyAsc[i - 1].close;
                      const curr = historyAsc[i].close;
                      if (prev > 0 && Number.isFinite(prev) && Number.isFinite(curr)) {
                        processed.historicalReturns.push(curr / prev - 1);
                      }
                    }
            
                    // Variaciones por fecha (calendario)
                    const latest = historyAsc[historyAsc.length - 1];
                    const latestPrice = latest.close;
            
                    const d7 = new Date(latest.date); d7.setDate(d7.getDate() - 7);
                    const p7 = findCloseByDate(historyAsc, d7.toISOString().slice(0, 10));
                    if (Number.isFinite(latestPrice) && Number.isFinite(p7) && p7! > 0) {
                      processed.weekChange = ((latestPrice / p7!) - 1) * 100;
                    }
            
                    // 90 días (3 meses aprox.)
                    const d90 = new Date(latest.date); d90.setDate(d90.getDate() - 90);
                    const p90 = findCloseByDate(historyAsc, d90.toISOString().slice(0, 10));
                    if (Number.isFinite(latestPrice) && Number.isFinite(p90) && p90! > 0) {
                      processed.quarterChange = ((latestPrice / p90!) - 1) * 100;
                    }
            
                    // YTD: comparar con el último cierre del “inicio de año”
                    const startYear = new Date(latest.date); startYear.setMonth(0, 1); // 1 de enero
                    const pYtd = findCloseByDate(historyAsc, startYear.toISOString().slice(0, 10));
                    if (Number.isFinite(latestPrice) && Number.isFinite(pYtd) && pYtd! > 0) {
                      processed.ytdChange = ((latestPrice / pYtd!) - 1) * 100;
                    }
            
                    // 30 días atrás
                    const d30 = new Date(latest.date);
                    d30.setDate(d30.getDate() - 30);
                    const price30 = findCloseByDate(historyAsc, d30.toISOString().slice(0, 10));
                    if (Number.isFinite(latestPrice) && Number.isFinite(price30) && price30! > 0) processed.monthChange = ((latestPrice / price30!) - 1) * 100;
            
            
                    // 365 días atrás
                    const d365 = new Date(latest.date);
                    d365.setDate(d365.getDate() - 365);
                    const price365 = findCloseByDate(historyAsc, d365.toISOString().slice(0, 10));
                    if (Number.isFinite(latestPrice) && Number.isFinite(price365) && price365! > 0) processed.yearChange = ((latestPrice / price365!) - 1) * 100;
            
                    // Desvío estándar (últimos 30 retornos) y Sharpe
                    const last30 = processed.historicalReturns.slice(-30);
                    const sdPct = computeStdDevPct(last30);
                    if(sdPct !== null) processed.stdDev = Number.isFinite(sdPct) ? sdPct : 'N/A';
            
                    const sharpeVal = computeSharpe(processed.historicalReturns);
                    if(sharpeVal !== null) processed.sharpeRatio = Number.isFinite(sharpeVal) ? sharpeVal : 'N/A';
            
                    const closes = historyAsc.map((d: { close: number }) => d.close);
            
                    // SMA helper
                    const sma = (arr: number[], w: number) => {
                      if (arr.length < w) return null;
                      let sum = 0;
                      for (let i = arr.length - w; i < arr.length; i++) sum += arr[i];
                      return sum / w;
                    };
            
                    // RSI(14)
                    const rsi14 = (() => {
                      const w = 14;
                      if (closes.length < w + 1) return null;
                      let gains = 0, losses = 0;
                      for (let i = closes.length - w; i < closes.length; i++) {
                        const diff = closes[i] - closes[i - 1];
                        if (diff >= 0) gains += diff; else losses -= diff;
                      }
                      const avgGain = gains / w;
                      const avgLoss = losses / w;
                      if (avgLoss === 0) return 100;
                      const rs = avgGain / avgLoss;
                      return 100 - (100 / (1 + rs));
                    })();
            
                    const sma50 = sma(closes, 50);
                    const sma200 = sma(closes, 200);
            
                    // Señal 1/0: cruce alcista si SMA50 > SMA200
                    const smaSignal = (Number.isFinite(sma50) && Number.isFinite(sma200)) ? (sma50! > sma200! ? 1 : 0) : 'N/A';
            
                    // Distancia a 52w high/low
                    const lastPrice = closes[closes.length - 1];
                    const period = 252; // ~52 semanas hábiles
                    const window = historyAsc.slice(-period);
                    if (Number.isFinite(lastPrice) && window.length > 0) {
                      const hi = Math.max(...window.map((d: { close: number }) => d.close));
                      const lo = Math.min(...window.map((d: { close: number }) => d.close));
                      const distHighPct = (hi > 0) ? ((hi - lastPrice) / hi) * 100 : null;   // cuánto falta para el máximo
                      const distLowPct = (lo > 0) ? ((lastPrice - lo) / lo) * 100 : null;   // cuánto se alejó del mínimo
                      if (distHighPct !== null) processed.data.dist52wHigh = Number.isFinite(distHighPct) ? distHighPct : 'N/A';
                      if (distLowPct !== null) processed.data.dist52wLow = Number.isFinite(distLowPct) ? distLowPct : 'N/A';
                    }
            
                    if(rsi14 !== null) processed.data.rsi14 = Number.isFinite(rsi14) ? rsi14 : 'N/A';
                    if(sma50 !== null) processed.data.sma50 = Number.isFinite(sma50) ? sma50 : 'N/A';
                    if(sma200 !== null) processed.data.sma200 = Number.isFinite(sma200) ? sma200 : 'N/A';
                    processed.data.smaSignal = smaSignal;
                  }

            const { error: cacheUpsertError } = await supabase
                .from('asset_data_cache')
                .upsert({
                    symbol: ticker,
                    data: processed,
                    last_updated_at: new Date().toISOString(),
                });

            if (cacheUpsertError) {
                console.error("Error al actualizar la caché:", cacheUpsertError.message);
                logger.warn('CACHE_UPSERT_FAILED', `Falló el upsert para ${ticker}`, { detail: cacheUpsertError.message });
            }

            return processed;

        } catch (e: any) {
            console.error('FMP error:', e);
            const msg = e?.message || 'Error al consultar datos del activo.';
            logger.error('API_FETCH_FAILED', `Failed to fetch data for ticker: ${ticker}`, { ticker: ticker, errorMessage: msg });
            showError('No pudimos traer los datos del activo.', { detail: msg });
            return null;
        }
    }, [checkApiLimit, config.api.fmpProxyEndpoints, showError]);

    const addTicker = useCallback(async (tickerRaw: string, fromPortfolio: boolean = false) => {
        const ticker = tickerRaw.trim().toUpperCase();
        if (!ticker) return;

        if (selectedTickers.includes(ticker)) {
            if (!fromPortfolio) showError('Este activo ya ha sido añadido.');
            return;
        }

        const freeSymbolsSet = new Set(config.plans.freeTierSymbols);
        if (profile?.role === 'basico' && !freeSymbolsSet.has(ticker)) {
            if (!fromPortfolio) showError(`El símbolo ${ticker} no está disponible en el plan Básico.`);
            return;
        }

        if (!fromPortfolio) {
            setError('');
            const maxTickers = config.dashboard.maxTickersToCompare[profile?.role as keyof typeof config.dashboard.maxTickersToCompare] || 2;
            if (selectedTickers.length >= maxTickers) {
                showError(`Puedes comparar hasta ${maxTickers} activos a la vez.`);
                return;
            }
        }

        setLoading(true);
        try {
            const { data: cached } = await supabase.from('asset_data_cache').select('data, last_updated_at').eq('symbol', ticker).single();
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            if (cached && new Date(cached.last_updated_at) > oneHourAgo) {
                setAssetsData((prev) => ({ ...prev, [ticker]: cached.data as AssetData }));
                setSelectedTickers((prev) => [...prev, ticker]);
            } else {
                const data = await fetchTickerData(ticker);
                if (data) {
                    setAssetsData((prev) => ({ ...prev, [ticker]: data }));
                    setSelectedTickers((prev) => [...prev, ticker]);
                } else if (cached) {
                    setAssetsData((prev) => ({ ...prev, [ticker]: cached.data as AssetData }));
                    setSelectedTickers((prev) => [...prev, ticker]);
                    showError(`No pudimos actualizar los datos para ${ticker}. Mostrando la última versión disponible.`);
                }
            }
        } catch (e: any) {
            showError('Ocurrió un error inesperado al agregar el activo.', { detail: e.message });
        } finally {
            setLoading(false);
        }
    }, [config.plans.freeTierSymbols, config.dashboard.maxTickersToCompare, profile?.role, selectedTickers, showError, fetchTickerData]);

    const removeTicker = useCallback((ticker: string) => {
        setSelectedTickers((prev) => prev.filter((t) => t !== ticker));
        setAssetsData((prev) => {
            const copy = { ...prev };
            delete copy[ticker];
            return copy;
        });
    }, []);

    const value = useMemo(
        (): DashboardContextType => ({
            indicatorConfig,
            selectedTickers,
            assetsData,
            addTicker,
            removeTicker,
            loading,
            error,
        }),
        [selectedTickers, assetsData, loading, error, addTicker, removeTicker]
    );

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}