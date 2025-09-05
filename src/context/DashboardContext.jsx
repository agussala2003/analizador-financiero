// src/context/DashboardContext.jsx
import { createContext, useContext, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';
import { computeSharpe, computeStdDevPct, findCloseByDate, FREE_TIER_SYMBOLS, getFirstPresent, indicatorConfig, meanArr, ROLE_LIMITS, sharpeFromReturns, stdDevArr, toNumber } from '../utils/financial';
import { logger } from '../lib/logger';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { user, profile } = useAuth();
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [assetsData, setAssetsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showError } = useError();

  // --- Límite diario de API por plan (tabla profiles)
  const checkApiLimit = async () => {
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];

    const { data: prof, error: selErr } = await supabase.from('profiles').select('api_calls_made,last_api_call_date,role').eq('id', user.id).maybeSingle();

    if (selErr || !prof) {
      console.error('profiles read error', selErr);
      setError('Error consultando el proveedor de datos.');
      showError('Error consultando el proveedor de datos.', { detail: selErr?.message });
      return false;
    }

    const role = prof.role || profile?.role || 'basico';
    const limit = ROLE_LIMITS[role] ?? ROLE_LIMITS.basico;

    let calls = prof.api_calls_made ?? 0;
    let lastDate = prof.last_api_call_date ?? null;

    // reset diario
    if (lastDate !== today) {
      calls = 0;
      lastDate = today;
    }

    if (calls >= limit) {
      const msg = `Has alcanzado tu límite de ${limit} consultas diarias`;
      setError(msg);
      showError(msg);
      return false;
    }

    const { error: upErr } = await supabase.from('profiles').update({ api_calls_made: calls + 1, last_api_call_date: today }).eq('id', user.id);

    if (upErr) {
      console.error('profiles update error', upErr);
      setError('No se pudo actualizar el contador de uso');
      showError('No se pudo actualizar el contador de uso', { detail: upErr.message });
      return false;
    }
    return true;
  };

  // --- Fetch a FMP + procesamiento
  const fetchTickerData = async (ticker) => {
    const allowed = await checkApiLimit();
    if (!allowed) return null;

    const endpointTemplates = [`stable/profile`,`stable/key-metrics-ttm`,`stable/quote`,`stable/historical-price-eod/full`, `stable/price-target-summary`];

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
      
      // 5. Extraemos los datos de cada respuesta
      const [profileRes, keyMetricsRes, quoteRes, historicalRes, priceTargetRes] = results.map(result => result.data);

      // Validaciones de shape
      if (!Array.isArray(profileRes) || profileRes.length === 0) throw new Error('Ticker no encontrado o respuesta inválida (profile).');

      if (!Array.isArray(keyMetricsRes)) throw new Error('Respuesta inválida (key-metrics-ttm).');

      if (!Array.isArray(quoteRes) || quoteRes.length === 0) throw new Error('Respuesta inválida (quote).');

      const companyProfile = profileRes[0] || {};
      if (companyProfile?.['Error Message']) throw new Error(companyProfile['Error Message']);

      const latestKeyMetrics = keyMetricsRes[0] || {};
      const companyQuote = quoteRes[0] || {};

      // "raw" consolida todo para facilitar el mapeo
      const raw = { ...companyProfile, ...latestKeyMetrics, ...companyQuote, ...priceTargetRes[0] };

      const processed = {
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
        marketCap: toNumber(raw.marketCap),
        lastDividend: toNumber(raw.lastDividend),
        averageVolume: toNumber(raw.averageVolume),
        lastMonthAvgPriceTarget: toNumber(raw.lastMonthAvgPriceTarget),
        range: raw.range,
        volume: toNumber(raw.volume),
        beta: toNumber(raw.beta),
        data: {},
        historicalReturns: [],
        currentPrice: toNumber(raw.price),
        dayChange: toNumber(raw.changePercentage), // %
        monthChange: 'N/A',
        yearChange: 'N/A',
        stdDev: 'N/A',      // % (últimos 30 retornos)
        sharpeRatio: 'N/A', // anualizado (252)
      };

      // --- Mapeo de indicadores con alias + compute

      Object.keys(indicatorConfig).forEach((key) => {
        const cfg = indicatorConfig[key];
        const aliases = Array.isArray(cfg.apiFields) ? cfg.apiFields : (cfg.apiField ? [cfg.apiField] : []);

        let val = getFirstPresent(raw, aliases);

        if ((val === null || val === undefined) && typeof cfg.compute === 'function') {
          const computed = cfg.compute(raw);
          const num = toNumber(computed);
          if (num !== null && Number.isFinite(num)) val = num;
        }

        const forcePercent = (cfg.asPercent ?? cfg.isPercentage) === true;
        if (forcePercent && Number.isFinite(val)) val = val * 100;

        processed.data[key] = (Number.isFinite(val)) ? val : 'N/A';
      });

      const histArray = Array.isArray(historicalRes) ? historicalRes : (historicalRes?.historical ?? []);

      // Filtrar válidos y ordenar ASC
      const historyAsc = histArray.filter((d) => d && d.date && Number.isFinite(toNumber(d.close))).map((d) => ({ date: d.date, close: toNumber(d.close) })).sort((a, b) => new Date(a.date) - new Date(b.date));

      processed.weekChange = 'N/A';
      processed.quarterChange = 'N/A'; // 3 meses (~90 días)
      processed.ytdChange = 'N/A';

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
        const p7 = findCloseByDate(historyAsc, d7.toISOString().slice(0,10));
        if (Number.isFinite(latestPrice) && Number.isFinite(p7) && p7 > 0) {
          processed.weekChange = ((latestPrice / p7) - 1) * 100;
        }

        // 90 días (3 meses aprox.)
        const d90 = new Date(latest.date); d90.setDate(d90.getDate() - 90);
        const p90 = findCloseByDate(historyAsc, d90.toISOString().slice(0,10));
        if (Number.isFinite(latestPrice) && Number.isFinite(p90) && p90 > 0) {
          processed.quarterChange = ((latestPrice / p90) - 1) * 100;
        }

        // YTD: comparar con el último cierre del “inicio de año”
        const startYear = new Date(latest.date); startYear.setMonth(0, 1); // 1 de enero
        const pYtd = findCloseByDate(historyAsc, startYear.toISOString().slice(0,10));
        if (Number.isFinite(latestPrice) && Number.isFinite(pYtd) && pYtd > 0) {
          processed.ytdChange = ((latestPrice / pYtd) - 1) * 100;
        }

        // 30 días atrás
        const d30 = new Date(latest.date);
        d30.setDate(d30.getDate() - 30);
        const price30 = findCloseByDate(historyAsc, d30.toISOString().slice(0, 10));
        if (Number.isFinite(latestPrice) && Number.isFinite(price30) && price30 > 0) processed.monthChange = ((latestPrice / price30) - 1) * 100;


        // 365 días atrás
        const d365 = new Date(latest.date);
        d365.setDate(d365.getDate() - 365);
        const price365 = findCloseByDate(historyAsc, d365.toISOString().slice(0, 10));
        if (Number.isFinite(latestPrice) && Number.isFinite(price365) && price365 > 0) processed.yearChange = ((latestPrice / price365) - 1) * 100;

        // Desvío estándar (últimos 30 retornos) y Sharpe
        const last30 = processed.historicalReturns.slice(-30);
        const sdPct = computeStdDevPct(last30);
        processed.stdDev = Number.isFinite(sdPct) ? sdPct : 'N/A';

        const sharpeVal = computeSharpe(processed.historicalReturns);
        processed.sharpeRatio = Number.isFinite(sharpeVal) ? sharpeVal : 'N/A';

        const closes = historyAsc.map(d => d.close);

        // SMA helper
        const sma = (arr, w) => {
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
        const smaSignal = (Number.isFinite(sma50) && Number.isFinite(sma200)) ? (sma50 > sma200 ? 1 : 0) : 'N/A';

        // Distancia a 52w high/low
        const lastPrice = closes[closes.length - 1];
        const period = 252; // ~52 semanas hábiles
        const window = historyAsc.slice(-period);
        if (Number.isFinite(lastPrice) && window.length > 0) {
          const hi = Math.max(...window.map(d => d.close));
          const lo = Math.min(...window.map(d => d.close));
          const distHighPct = (hi > 0) ? ((hi - lastPrice) / hi) * 100 : null;   // cuánto falta para el máximo
          const distLowPct = (lo > 0) ? ((lastPrice - lo) / lo) * 100 : null;   // cuánto se alejó del mínimo
          processed.data.dist52wHigh = Number.isFinite(distHighPct) ? distHighPct : 'N/A';
          processed.data.dist52wLow = Number.isFinite(distLowPct) ? distLowPct : 'N/A';
        }

        processed.data.rsi14 = Number.isFinite(rsi14) ? rsi14 : 'N/A';
        processed.data.sma50 = Number.isFinite(sma50) ? sma50 : 'N/A';
        processed.data.sma200 = Number.isFinite(sma200) ? sma200 : 'N/A';
        processed.data.smaSignal = smaSignal;
      }
      return processed;
    } catch (e) {
      console.error('FMP error:', e);
      const msg = e?.message || 'Error al consultar datos del activo.';
      logger.error('API_FETCH_FAILED', `Failed to fetch data for ticker: ${ticker}`, { ticker: ticker, errorMessage: msg, errorStack: e.stack, });
      setError(msg);
      showError('No pudimos traer los datos del activo.', { detail: msg });
      return null;
    }
  };

  // --- API pública del contexto
  const addTicker = async (tickerRaw) => {
    const ticker = tickerRaw.trim().toUpperCase();
    if (!ticker) return;

    // ✅ Nueva validación
    if (profile?.role === 'basico' && !FREE_TIER_SYMBOLS.has(ticker)) {
      showError(`El símbolo ${ticker} no está disponible en el plan Básico.`, { title: 'Función Premium' });
      return;
    }

    // reset de error previo
    setError('');

    if (selectedTickers.length >= 10) {
      const msg = 'Puedes comparar hasta 10 activos a la vez.';
      setError(msg);
      showError(msg);
      return;
    }
    if (selectedTickers.includes(ticker)) {
      const msg = 'Este activo ya ha sido añadido.';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchTickerData(ticker);
      if (!data) return; // error ya mostrado
      setSelectedTickers((prev) => [...prev, ticker]);
      setAssetsData((prev) => ({ ...prev, [ticker]: data }));

      logger.info('TICKER_ADDED', `User added ticker: ${ticker}`, { ticker });
    } catch (e) {
      console.error('addTicker error:', e);
      const msg = 'Ocurrió un error inesperado al agregar el activo.';
      setError(msg);
      showError(msg, { detail: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const removeTicker = (ticker) => {
    setSelectedTickers((prev) => prev.filter((t) => t !== ticker));
    setAssetsData((prev) => { const copy = { ...prev }; delete copy[ticker]; return copy; });
  };

  const value = useMemo(
    () => ({
      indicatorConfig,
      selectedTickers,
      assetsData,
      addTicker,
      removeTicker,
      loading,
      error,
      role: profile?.role || 'basico',
      // Helpers expuestos por si los necesitás en la UI
      mean: meanArr,
      stdDev: stdDevArr,
      sharpe: sharpeFromReturns,
    }),
    [selectedTickers, assetsData, loading, error, profile]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
