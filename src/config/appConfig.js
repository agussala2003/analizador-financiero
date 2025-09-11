// src/config/appConfig.js
import { logger } from '../lib/logger';

/**
 * Configuración global de la aplicación financiera
 * 
 * ARQUITECTURA: Solo frontend + Supabase
 * - No hay backend propio
 * - Datos almacenados en Supabase
 * - APIs externas opcionales para datos financieros
 * - Todo funciona desde el navegador
 */

/**
 * Configuración global de la aplicación
 */
export const defaultConfig = {
  // Configuración de cache
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    cleanupInterval: 30 * 1000, // 30 segundos
    financialApi: {
      ttl: 30 * 1000, // 30 segundos para datos financieros
      maxSize: 50
    }
  },

  // Configuración de rate limiting (ajustado para Supabase)
  rateLimit: {
    enabled: true,
    // Límites para interacciones con Supabase
    supabaseLimits: {
      basico: { requests: 50, window: 60000 },      // 50 por minuto para usuarios básicos
      premium: { requests: 200, window: 60000 },    // 200 por minuto para premium
      administrador: { requests: 500, window: 60000 } // 500 por minuto para admin
    },
    // Límites para APIs externas
    externalApiLimits: {
      basico: { requests: 10, window: 60000 },      // 10 llamadas por minuto a APIs externas
      premium: { requests: 50, window: 60000 },     // 50 llamadas por minuto
      administrador: { requests: 100, window: 60000 } // 100 llamadas por minuto
    },
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    }
  },

  // Configuración de validación
  validation: {
    enabled: true,
    validateOnChange: false,
    validateOnBlur: true,
    debounceMs: 300,
    showPasswordStrength: true,
    enableSanitization: true
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    defaultDuration: 5000,
    maxNotifications: 5,
    position: 'top-right',
    financial: {
      priceAlerts: true,
      dividendAlerts: true,
      newsAlerts: true,
      portfolioChanges: true,
      thresholds: {
        priceChange: 5, // Alertar cambios > 5%
        volumeChange: 50, // Alertar cambios de volumen > 50%
        newsImportance: 'medium' // Alertar noticias de importancia media o alta
      }
    },
    types: {
      success: { duration: 4000, icon: '✅' },
      error: { duration: 8000, icon: '❌', persistent: true },
      warning: { duration: 6000, icon: '⚠️' },
      info: { duration: 5000, icon: 'ℹ️' },
      loading: { persistent: true, icon: '⏳' }
    }
  },

  // Configuración de búsqueda inteligente
  search: {
    enabled: true,
    minQueryLength: 2,
    debounceMs: 300,
    maxSuggestions: 8,
    enableLearning: true,
    maxHistoryItems: 100,
    maxPopularItems: 20,
    categories: {
      stocks: { weight: 1.0, enabled: true },
      news: { weight: 0.8, enabled: true },
      blogs: { weight: 0.6, enabled: true },
      analysis: { weight: 0.7, enabled: true }
    }
  },

  // Configuración de onboarding
  onboarding: {
    enabled: true,
    autoStart: true,
    enableAnalytics: true,
    showTooltips: true,
    skipAfterDays: 30,
    tours: {
      dashboard: { enabled: true, autoStart: false },
      portfolio: { enabled: true, autoStart: false },
      search: { enabled: true, autoStart: false }
    }
  },

  // Configuración de logging
  logging: {
    enabled: true,
    level: 'info', // 'debug', 'info', 'warn', 'error'
    enablePerformance: true,
    enableUserTracking: true,
    batchSize: 10,
    flushInterval: 30000
  },

  // Configuración de Supabase y APIs externas
  supabase: {
    timeout: 10000,
    retryAttempts: 3,
    realtime: {
      enabled: true,
      autoReconnect: true,
      heartbeatInterval: 30000
    },
    storage: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  
  // APIs financieras externas (solo si las usas)
  externalApis: {
    finnhub: {
      enabled: false, // Cambiar a true si tienes API key
      rateLimit: { requests: 60, window: 60000 } // 60 por minuto gratis
    },
    polygon: {
      enabled: false, // Cambiar a true si tienes API key
      rateLimit: { requests: 5, window: 60000 } // 5 por minuto gratis
    },
    // APIs gratuitas que no requieren key
    freeApis: {
      enabled: true,
      yahoo: { rateLimit: { requests: 100, window: 60000 } },
      investing: { rateLimit: { requests: 50, window: 60000 } }
    }
  },

  // Features flags
  features: {
    notifications: true,
    smartSearch: true,
    onboarding: true,
    tooltips: true,
    tours: true,
    caching: true,
    rateLimit: true,
    validation: true,
    analytics: true,
    darkMode: false, // Para futura implementación
    realTimeUpdates: true,
    offlineMode: false // Para futura implementación
  },

  // UI y UX
  ui: {
    theme: 'dark',
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    },
    sidebar: {
      collapsible: true,
      defaultCollapsed: false
    },
    tables: {
      pageSize: 10,
      enableSorting: true,
      enableFiltering: true
    }
  }
};

/**
 * Función para cargar configuración con overrides del usuario
 */
export function loadConfig() {
  try {
    const userConfig = localStorage.getItem('app_config');
    if (userConfig) {
      const parsed = JSON.parse(userConfig);
      return mergeConfig(defaultConfig, parsed);
    }
    return defaultConfig;
  } catch (error) {
    logger.error('CONFIG_LOAD_ERROR', 'Error cargando configuración', {
      error: error.message
    });
    return defaultConfig;
  }
}

/**
 * Función para guardar configuración
 */
export function saveConfig(config) {
  try {
    localStorage.setItem('app_config', JSON.stringify(config));
    logger.info('CONFIG_SAVED', 'Configuración guardada', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('CONFIG_SAVE_ERROR', 'Error guardando configuración', {
      error: error.message
    });
  }
}

/**
 * Función para hacer merge profundo de configuraciones
 */
function mergeConfig(defaultConfig, userConfig) {
  const merged = { ...defaultConfig };
  
  for (const key in userConfig) {
    if (userConfig.hasOwnProperty(key)) {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        merged[key] = { ...defaultConfig[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    }
  }
  
  return merged;
}

/**
 * Configuraciones específicas por entorno
 */
export const environmentConfigs = {
  development: {
    logging: {
      level: 'debug',
      enablePerformance: true
    },
    supabase: {
      timeout: 30000 // Más tiempo en desarrollo para debugging
    },
    cache: {
      defaultTTL: 2 * 60 * 1000 // 2 minutos en desarrollo para testing
    }
  },
  
  production: {
    logging: {
      level: 'warn',
      enablePerformance: false
    },
    cache: {
      defaultTTL: 10 * 60 * 1000 // 10 minutos en producción
    },
    supabase: {
      timeout: 10000 // Timeout más estricto en producción
    }
  },
  
  test: {
    notifications: {
      enabled: false
    },
    onboarding: {
      enabled: false
    },
    supabase: {
      realtime: {
        enabled: false // Deshabilitar realtime en tests
      }
    }
  }
};

/**
 * Función para obtener configuración por entorno
 */
export function getEnvironmentConfig() {
  const env = 'development';
  const baseConfig = loadConfig();
  const envConfig = environmentConfigs[env] || {};
  
  return mergeConfig(baseConfig, envConfig);
}

export default defaultConfig;
