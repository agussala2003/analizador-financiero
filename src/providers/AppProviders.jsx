// src/providers/AppProviders.jsx
import { createContext, useCallback, useEffect, useState } from 'react';
import { NotificationProvider } from './NotificationProvider';
import { logger } from '../lib/logger';
import { UserContext } from '../context/userContext';

/**
 * Provider principal que combina todos los contexts
 */
export function AppProviders({ children }) {
  useEffect(() => {
    logger.info('APP_PROVIDERS_INITIALIZED', 'Providers de aplicación inicializados');
  }, []);

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}

/**
 * Provider de configuración global
 */
const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    // Cache settings
    cache: {
      enabled: true,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 100,
      financialApiTTL: 30 * 1000 // 30 segundos para datos financieros
    },
    
    // Rate limiting settings
    rateLimit: {
      enabled: true,
      defaultLimits: {
        guest: { requests: 10, window: 60000 },
        user: { requests: 100, window: 60000 },
        premium: { requests: 1000, window: 60000 }
      },
      financialApiLimits: {
        guest: { requests: 5, window: 60000 },
        user: { requests: 50, window: 60000 },
        premium: { requests: 200, window: 60000 }
      }
    },
    
    // Validation settings
    validation: {
      enabled: true,
      validateOnChange: false,
      validateOnBlur: true,
      debounceMs: 300
    },
    
    // Notification settings
    notifications: {
      enabled: true,
      defaultDuration: 5000,
      maxNotifications: 5,
      financial: {
        priceAlerts: true,
        dividendAlerts: true,
        newsAlerts: true,
        portfolioChanges: true
      }
    },
    
    // Search settings
    search: {
      enabled: true,
      minQueryLength: 2,
      debounceMs: 300,
      maxSuggestions: 8,
      enableLearning: true
    },
    
    // Onboarding settings
    onboarding: {
      enabled: true,
      autoStart: true,
      enableAnalytics: true,
      showTooltips: true
    }
  });

  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
    
    logger.info('CONFIG_UPDATED', 'Configuración actualizada', { updates });
  }, []);

  useEffect(() => {
    // Cargar configuración guardada
    try {
      const savedConfig = localStorage.getItem('app_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      logger.error('CONFIG_LOAD_ERROR', 'Error cargando configuración', {
        error: error.message
      });
    }
  }, []);

  // Guardar configuración automáticamente
  useEffect(() => {
    try {
      localStorage.setItem('app_config', JSON.stringify(config));
    } catch (error) {
      logger.error('CONFIG_SAVE_ERROR', 'Error guardando configuración', {
        error: error.message
      });
    }
  }, [config]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}
/**
 * Provider de datos de usuario
 */


export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Simular carga de datos de usuario
    const loadUserData = async () => {
      try {
        // Aquí normalmente cargarías desde tu API
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
          setOnboardingCompleted(parsed.onboardingCompleted || false);
        }
      } catch (error) {
        logger.error('USER_LOAD_ERROR', 'Error cargando datos de usuario', {
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      
      try {
        localStorage.setItem('user_data', JSON.stringify(newUser));
      } catch (error) {
        logger.error('USER_SAVE_ERROR', 'Error guardando datos de usuario', {
          error: error.message
        });
      }
      
      return newUser;
    });
  }, []);

  const completeOnboarding = useCallback((onboardingData) => {
    setOnboardingCompleted(true);
    updateUser({ 
      onboardingCompleted: true,
      onboardingData,
      profile: onboardingData.userProfile
    });
    
    logger.info('USER_ONBOARDING_COMPLETED', 'Onboarding de usuario completado', {
      userType: onboardingData.userProfile?.type,
      interests: onboardingData.userProfile?.interests?.length || 0,
      goals: onboardingData.userProfile?.goals?.length || 0
    });
  }, [updateUser]);

  return (
    <UserContext.Provider value={{
      user,
      loading,
      onboardingCompleted,
      updateUser,
      completeOnboarding,
      isAuthenticated: !!user,
      userType: user?.profile?.type || 'guest'
    }}>
      {children}
    </UserContext.Provider>
  );
}
/**
 * Provider combinado con todos los contextos
 */
export function CombinedProvider({ children }) {
  return (
    <ConfigProvider>
      <UserProvider>
        <AppProviders>
          {children}
        </AppProviders>
      </UserProvider>
    </ConfigProvider>
  );
}

export default CombinedProvider;
