// src/providers/auth-provider.tsx

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContextType, Profile } from '../types/auth';
import { logger } from '../lib/logger';
import { toast } from 'sonner';
import { LoadingScreen } from '../components/ui/loading-screen';
import { ErrorScreen } from '../components/ui/error-screen';

// ✅ Mejora: Contexto con guard que lanza si se usa fuera del Provider
const authContextGuard = new Proxy({}, {
  get: () => {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
}) as AuthContextType;

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>(authContextGuard);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // ✅ Cancelar requests pendientes
  const fetchInProgressRef = useRef(false); // ✅ Prevenir llamadas concurrentes
  const initPromiseRef = useRef<Promise<unknown> | null>(null); // ✅ Evitar doble inicialización

  const fetchProfile = useCallback(async (user: User | null, signal?: AbortSignal) => {
    if (!user) {
      setProfile(null);
      return;
    }

    // ✅ Prevenir múltiples llamadas concurrentes
    if (fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;

    try {
      const resp = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // ✅ Si la request fue abortada, no actualizar el estado
      if (signal?.aborted) {
        return;
      }

      if (resp.error) throw resp.error;
      const dataUnknown = resp.data as unknown;
      if (dataUnknown && typeof dataUnknown === 'object') {
        setProfile(dataUnknown as Profile);
      } else {
        setProfile(null);
      }
    } catch (error: unknown) {
      // ✅ No loggear errores si fue cancelación intencional
      if (signal?.aborted) {
        return;
      }
      const msg = error instanceof Error ? error.message : 'Fallo al obtener perfil';
      void logger.error('AUTH_PROFILE_FETCH_FAILED', msg);
      setProfile(null);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    // ✅ Si ya hay una inicialización en progreso, no iniciar otra
    if (initPromiseRef.current) {
      console.log('[AUTH] Initialization already in progress, skipping...');
      return;
    }

    console.log('[AUTH] Starting new initialization...');

    // ✅ Crear AbortController para cancelar requests al desmontar
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const initializeAndListen = async () => {
      console.log('[AUTH] Starting initialization...');
      setLoading(true);
      setError(null);
      try {
        // 1. Carga la sesión inicial de forma silenciosa.
        console.log('[AUTH] Fetching initial session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('[AUTH] Initial session fetched:', { hasSession: !!initialSession, aborted: abortController.signal.aborted });
        
        // ✅ Verificar si fue abortado antes de continuar
        if (abortController.signal.aborted) {
          console.log('[AUTH] Aborted after getSession');
          return;
        }
        
        setSession(initialSession);
        console.log('[AUTH] Fetching profile...');
        await fetchProfile(initialSession?.user ?? null, abortController.signal);
        console.log('[AUTH] Profile fetched, setting isLoaded=true');
        
        if (abortController.signal.aborted) {
          console.log('[AUTH] Aborted after fetchProfile');
          return;
        }
        setIsLoaded(true);
        console.log('[AUTH] Initialization complete!');
      } catch (err: unknown) {
        if (abortController.signal.aborted) {
          console.log('[AUTH] Aborted during error handling');
          return;
        }
        const msg = err instanceof Error ? err.message : 'Fallo inicializando autenticación';
        console.error('[AUTH] Initialization error:', msg);
        void logger.error('AUTH_INIT_FAILED', msg);
        setError('No pudimos inicializar la sesión.');
      } finally {
        if (!abortController.signal.aborted) {
          console.log('[AUTH] Setting loading=false');
          setLoading(false);
        }
      }

      // 2. Se suscribe a los cambios de autenticación.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          // ✅ Verificar si el componente sigue montado
          if (abortController.signal.aborted) return;
          
          // Cada vez que la sesión cambie (login/logout), se actualiza todo.
          setLoading(true);
          setError(null);
          try {
            setSession(newSession);
            await fetchProfile(newSession?.user ?? null, abortController.signal);
            
            if (abortController.signal.aborted) return;
            setIsLoaded(true);
          } catch (err: unknown) {
            if (abortController.signal.aborted) return;
            const msg = err instanceof Error ? err.message : 'Fallo al manejar cambio de autenticación';
            void logger.error('AUTH_STATE_CHANGE_FAILED', msg);
            setError('Ocurrió un problema actualizando tu sesión.');
          } finally {
            if (!abortController.signal.aborted) {
              setLoading(false);
            }
          }
        }
      );
      
      return subscription;
    };

  // ✅ Guardar la promesa para evitar doble inicialización
    const initPromise = initializeAndListen();
    initPromiseRef.current = initPromise;

    const subscriptionPromise = initPromise;

    // ✅ Limpieza mejorada: cancelar requests pendientes y desuscribirse
    return () => {
      console.log('[AUTH] Cleanup: aborting controller and unsubscribing');
      abortController.abort(); // Cancela todas las requests pendientes
      initPromiseRef.current = null; // ✅ Reset para permitir nueva inicialización
      void subscriptionPromise.then(subscription => subscription?.unsubscribe());
    };
  }, [fetchProfile]);

  const signOut = async (): Promise<void> => {
    const toastId = toast.loading('Cerrando sesión...');
    await supabase.auth.signOut();
    // El listener onAuthStateChange se encarga del resto.
    toast.dismiss(toastId);
    toast.success('Sesión cerrada');
    setProfile(null);
    setSession(null);
    window.location.href = '/login';
    window.location.reload();
  };

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      // ✅ Crear nuevo AbortController para el refresh
      const refreshAbortController = new AbortController();
      await fetchProfile(session.user, refreshAbortController.signal);
    }
  }, [session, fetchProfile]);

  // ✅ Manejar visibilidad de la página para prevenir requests clavadas
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        // Cuando vuelves a la pestaña, refrescar el perfil
        void refreshProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, refreshProfile]);

  const retryInit = async () => {
    // ✅ Mejora: permitir reintento desde ErrorScreen
    console.log('[AUTH] Retry initialization requested');
    initPromiseRef.current = null; // Reset para permitir nueva inicialización
    setError(null);
    setIsLoaded(false);
    setLoading(true);
    
    // ✅ Cancelar cualquier request anterior y crear nuevo AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const retryAbortController = new AbortController();
    abortControllerRef.current = retryAbortController;
    
    try {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (retryAbortController.signal.aborted) return;
      
      setSession(initialSession);
      await fetchProfile(initialSession?.user ?? null, retryAbortController.signal);
      
      if (retryAbortController.signal.aborted) return;
      setIsLoaded(true);
    } catch (err: unknown) {
      if (retryAbortController.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Fallo reintentando autenticación';
      void logger.error('AUTH_RETRY_FAILED', msg);
      setError('No pudimos reintentar la inicialización.');
    } finally {
      if (!retryAbortController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    profile,
    isLoaded,
    loading,
    error,
    signOut,
    refreshProfile,
  };

  // ✅ Timeout de seguridad: si pasa más de 10s en loading, mostrar error
  useEffect(() => {
    if (!loading || isLoaded) return;

    console.log('[AUTH] Starting safety timeout (10s)...');
    const timeoutId = setTimeout(() => {
      if (loading && !isLoaded) {
        console.error('[AUTH] Safety timeout triggered! Still loading after 10s');
        setError('La inicialización está tomando demasiado tiempo. Por favor, recarga la página.');
        setLoading(false);
      }
    }, 10000); // 10 segundos

    return () => {
      console.log('[AUTH] Clearing safety timeout');
      clearTimeout(timeoutId);
    };
  }, [loading, isLoaded]);

  console.log('[AUTH] Render state:', { loading, isLoaded, error: !!error, hasSession: !!session });

  // ✅ Mejora: Evitar pantallas en blanco y manejar errores de forma genérica
  if (loading && !isLoaded) {
    return <LoadingScreen message="Inicializando sesión..." />;
  }
  if (error) {
    return (
      <ErrorScreen
        title="Error de autenticación"
        message={error}
        onRetry={() => { void retryInit(); }}
      />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};