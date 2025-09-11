// src/hooks/useRateLimit.js
import { useRef, useCallback, useState } from 'react';
import { logger } from '../lib/logger';
import { useAuth } from './useAuth';
import { useConfig } from './useConfig';

/**
 * Hook para implementar rate limiting inteligente
 * @param {number} limit - Número máximo de requests por ventana
 * @param {number} windowMs - Tamaño de ventana en milisegundos
 * @param {string} scope - Alcance del rate limit ('global', 'user', 'custom')
 */
export function useRateLimit(limit, windowMs = 60000, scope = 'user') {
  const { user, profile } = useAuth();
  const config = useConfig();
  const [requestCount, setRequestCount] = useState(0);
  const [resetTime, setResetTime] = useState(null);
  
  // Obtener límites dinámicos basados en el rol del usuario
  const effectiveLimit = limit || config.plans.roleLimits[profile?.role] || config.plans.roleLimits.basico;
  
  // Referencias para tracking de requests
  const requestsRef = useRef([]);
  const scopeKey = scope === 'user' ? user?.id : scope;
  
  // Storage global para diferentes scopes
  const globalStorage = useRef(
    window.__RATE_LIMIT_STORAGE__ || (window.__RATE_LIMIT_STORAGE__ = new Map())
  );

  const getRateLimitData = useCallback(() => {
    if (scope === 'global') {
      return requestsRef.current;
    }
    
    const storage = globalStorage.current;
    if (!storage.has(scopeKey)) {
      storage.set(scopeKey, []);
    }
    return storage.get(scopeKey);
  }, [scope, scopeKey]);

  const cleanOldRequests = useCallback((requests, windowStart) => {
    const cleaned = requests.filter(time => time > windowStart);
    if (scope === 'global') {
      requestsRef.current = cleaned;
    } else {
      globalStorage.current.set(scopeKey, cleaned);
    }
    return cleaned;
  }, [scope, scopeKey]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const requests = getRateLimitData();
    
    // Limpiar requests antiguos
    const activeRequests = cleanOldRequests(requests, windowStart);
    
    setRequestCount(activeRequests.length);
    
    if (activeRequests.length > 0) {
      const oldestRequest = Math.min(...activeRequests);
      setResetTime(oldestRequest + windowMs);
    }

    const oldestRequest = activeRequests.length > 0 ? Math.min(...activeRequests) : null;
    
    return {
      allowed: activeRequests.length < effectiveLimit,
      current: activeRequests.length,
      limit: effectiveLimit,
      resetTime: activeRequests.length > 0 ? oldestRequest + windowMs : null,
      retryAfter: activeRequests.length >= effectiveLimit ? 
        Math.ceil((oldestRequest + windowMs - now) / 1000) : 0
    };
  }, [effectiveLimit, windowMs, getRateLimitData, cleanOldRequests]);

  const makeRequest = useCallback(async (requestFn, options = {}) => {
    const { 
      bypassRateLimit = false, 
      priority = 'normal',
      retryOnLimit = false,
      maxRetries = 3 
    } = options;

    // Bypass para administradores o requests especiales
    if (bypassRateLimit || profile?.role === 'administrador') {
      logger.info('RATE_LIMIT_BYPASSED', 'Rate limit omitido', {
        reason: bypassRateLimit ? 'explicit_bypass' : 'admin_role',
        userId: user?.id,
        userRole: profile?.role
      });
      return await requestFn();
    }

    const rateLimitStatus = checkRateLimit();
    
    if (!rateLimitStatus.allowed) {
      const error = new Error(`Rate limit excedido. Límite: ${rateLimitStatus.limit} requests por ${windowMs/1000}s. Reintentar en ${rateLimitStatus.retryAfter}s`);
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.retryAfter = rateLimitStatus.retryAfter;
      error.rateLimitStatus = rateLimitStatus;
      
      logger.warn('RATE_LIMIT_EXCEEDED', 'Rate limit alcanzado', {
        userId: user?.id,
        userRole: profile?.role,
        currentRequests: rateLimitStatus.current,
        limit: rateLimitStatus.limit,
        retryAfter: rateLimitStatus.retryAfter,
        scope,
        priority
      });
      
      // Reintentar automáticamente si está habilitado
      if (retryOnLimit && maxRetries > 0) {
        logger.info('RATE_LIMIT_RETRY_SCHEDULED', 'Reintento programado', {
          retryAfter: rateLimitStatus.retryAfter,
          remainingRetries: maxRetries - 1
        });
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await makeRequest(requestFn, {
                ...options,
                maxRetries: maxRetries - 1
              });
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, rateLimitStatus.retryAfter * 1000);
        });
      }
      
      throw error;
    }
    
    // Registrar el request
    const now = Date.now();
    const requests = getRateLimitData();
    requests.push(now);
    
    if (scope !== 'global') {
      globalStorage.current.set(scopeKey, requests);
    }
    
    setRequestCount(requests.length);
    
    logger.info('RATE_LIMIT_REQUEST_ALLOWED', 'Request permitido', {
      userId: user?.id,
      currentRequests: requests.length,
      limit: effectiveLimit,
      scope,
      priority
    });
    
    try {
      const result = await requestFn();
      
      logger.info('RATE_LIMIT_REQUEST_COMPLETED', 'Request completado exitosamente', {
        userId: user?.id,
        executionTime: Date.now() - now,
        scope
      });
      
      return result;
    } catch (error) {
      logger.error('RATE_LIMIT_REQUEST_FAILED', 'Request falló', {
        userId: user?.id,
        error: error.message,
        executionTime: Date.now() - now,
        scope
      });
      throw error;
    }
  }, [effectiveLimit, windowMs, checkRateLimit, getRateLimitData, user, profile, scope, scopeKey]);

  const getRemainingRequests = useCallback(() => {
    const status = checkRateLimit();
    return Math.max(0, status.limit - status.current);
  }, [checkRateLimit]);

  const getTimeUntilReset = useCallback(() => {
    const status = checkRateLimit();
    return status.resetTime ? Math.max(0, status.resetTime - Date.now()) : 0;
  }, [checkRateLimit]);

  // API pública del hook
  return {
    makeRequest,
    checkRateLimit,
    getRemainingRequests,
    getTimeUntilReset,
    currentRequests: requestCount,
    limit: effectiveLimit,
    resetTime,
    
    // Utilidades adicionales
    isNearLimit: () => getRemainingRequests() <= Math.ceil(effectiveLimit * 0.1), // 10% del límite
    getUsagePercentage: () => (requestCount / effectiveLimit) * 100,
    
    // Para debugging
    debug: () => ({
      scope,
      scopeKey,
      currentRequests: requestCount,
      limit: effectiveLimit,
      windowMs,
      userRole: profile?.role,
      storage: globalStorage.current.get(scopeKey) || []
    })
  };
}

/**
 * Hook especializado para APIs financieras con diferentes límites por endpoint
 */
export function useFinancialRateLimit(endpoint) {
  // Límites específicos por endpoint
  const endpointLimits = {
    'fmp-proxy': { limit: 100, window: 60000 }, // 100 por minuto
    'real-time': { limit: 10, window: 60000 },  // 10 por minuto
    'historical': { limit: 50, window: 60000 }, // 50 por minuto
    'search': { limit: 20, window: 60000 }      // 20 por minuto
  };
  
  const endpointConfig = endpointLimits[endpoint] || endpointLimits['fmp-proxy'];
  
  return useRateLimit(
    endpointConfig.limit,
    endpointConfig.window,
    `api_${endpoint}`
  );
}
