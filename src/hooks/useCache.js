// src/hooks/useCache.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

/**
 * Hook para implementar caché en memoria con TTL
 * @param {string} key - Clave única para el caché
 * @param {Function} fetcher - Función que obtiene los datos
 * @param {number} ttl - Tiempo de vida en milisegundos (default: 5 minutos)
 * @param {boolean} enabled - Si el caché está habilitado (default: true)
 */
export function useCache(key, fetcher, ttl = 5 * 60 * 1000, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  // Cache global para compartir entre componentes
  const cacheRef = useRef(
    window.__FINANCIAL_CACHE__ || (window.__FINANCIAL_CACHE__ = new Map())
  );

  const invalidateCache = useCallback((cacheKey = key) => {
    cacheRef.current.delete(cacheKey);
    logger.info('CACHE_INVALIDATED', 'Caché invalidado manualmente', {
      key: cacheKey,
      cacheSize: cacheRef.current.size
    });
  }, [key]);

  const clearAllCache = useCallback(() => {
    const size = cacheRef.current.size;
    cacheRef.current.clear();
    logger.info('CACHE_CLEARED_ALL', 'Todo el caché fue limpiado', {
      clearedEntries: size
    });
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled && !forceRefresh) {
      try {
        setLoading(true);
        const result = await fetcher();
        setData(result);
        setError(null);
        setLastFetch(Date.now());
      } catch (err) {
        setError(err);
        logger.error('CACHE_FETCH_FAILED', 'Error al obtener datos sin caché', {
          key,
          error: err.message
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    const cache = cacheRef.current;
    const cached = cache.get(key);
    const now = Date.now();

    // Verificar si tenemos datos válidos en caché
    if (!forceRefresh && cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      setError(cached.error || null);
      setLastFetch(cached.timestamp);
      setLoading(false);
      
      logger.info('CACHE_HIT', 'Datos obtenidos desde caché', {
        key,
        age: now - cached.timestamp,
        ttl
      });
      return;
    }

    // Obtener datos frescos
    try {
      setLoading(true);
      logger.info('CACHE_FETCH_START', 'Iniciando obtención de datos frescos', {
        key,
        forceRefresh,
        cacheExpired: cached ? (now - cached.timestamp) >= ttl : 'no_cache'
      });

      const result = await fetcher();
      const timestamp = Date.now();
      
      // Guardar en caché
      cache.set(key, { 
        data: result, 
        timestamp,
        error: null
      });
      
      setData(result);
      setError(null);
      setLastFetch(timestamp);
      
      logger.info('CACHE_FETCH_SUCCESS', 'Datos obtenidos y guardados en caché', {
        key,
        dataSize: JSON.stringify(result).length,
        cacheSize: cache.size
      });

    } catch (err) {
      // Guardar error en caché para evitar requests repetidos
      cache.set(key, { 
        data: null, 
        timestamp: Date.now(),
        error: err
      });
      
      setError(err);
      logger.error('CACHE_FETCH_FAILED', 'Error al obtener datos', {
        key,
        error: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  // Limpiar caché expirado automáticamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const cache = cacheRef.current;
      const now = Date.now();
      let cleanedCount = 0;

      for (const [cacheKey, cacheEntry] of cache.entries()) {
        if (now - cacheEntry.timestamp > ttl * 2) { // Limpiar después de 2x TTL
          cache.delete(cacheKey);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info('CACHE_CLEANUP', 'Limpieza automática de caché', {
          cleanedEntries: cleanedCount,
          remainingEntries: cache.size
        });
      }
    }, ttl); // Limpiar cada TTL

    return () => clearInterval(cleanupInterval);
  }, [ttl]);

  // Fetch inicial
  useEffect(() => {
    if (key && fetcher) {
      fetchData();
    }
  }, [key, fetcher, fetchData]); // Solo re-fetch cuando cambie la key

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    invalidateCache,
    clearAllCache,
    isFromCache: data && cacheRef.current.has(key)
  };
}

/**
 * Hook para caché específico de APIs financieras
 */
export function useFinancialCache(endpoint, params = {}, options = {}) {
  const key = `financial_${endpoint}_${JSON.stringify(params)}`;
  const ttl = options.ttl || (endpoint.includes('real-time') ? 30000 : 300000); // 30s para real-time, 5min para otros
  
  const fetcher = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke(endpoint, { body: params });
    if (error) throw error;
    return data;
  }, [endpoint, params]);

  return useCache(key, fetcher, ttl, options.enabled);
}

/**
 * Utilidad para pre-cargar datos en caché
 */
export function preloadCache(key, fetcher) {
  const cache = window.__FINANCIAL_CACHE__ || (window.__FINANCIAL_CACHE__ = new Map());
  
  if (!cache.has(key)) {
    fetcher()
      .then(data => {
        cache.set(key, { data, timestamp: Date.now(), error: null });
        logger.info('CACHE_PRELOADED', 'Datos pre-cargados en caché', { key });
      })
      .catch(error => {
        logger.error('CACHE_PRELOAD_FAILED', 'Error al pre-cargar caché', { key, error: error.message });
      });
  }
}
