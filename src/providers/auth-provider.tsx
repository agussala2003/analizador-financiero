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
  const hasInitialized = useRef(false); // La clave para evitar doble ejecución

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const resp = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (resp.error) throw resp.error;
      const dataUnknown = resp.data as unknown;
      if (dataUnknown && typeof dataUnknown === 'object') {
        setProfile(dataUnknown as Profile);
      } else {
        setProfile(null);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Fallo al obtener perfil';
      void logger.error('AUTH_PROFILE_FETCH_FAILED', msg);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Gracias al useRef, todo este bloque solo se ejecutará UNA VEZ.
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAndListen = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Carga la sesión inicial de forma silenciosa.
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        await fetchProfile(initialSession?.user ?? null);
        setIsLoaded(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Fallo inicializando autenticación';
        void logger.error('AUTH_INIT_FAILED', msg);
        setError('No pudimos inicializar la sesión.');
      } finally {
        setLoading(false);
      }

      // 2. Se suscribe a los cambios de autenticación.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          // Cada vez que la sesión cambie (login/logout), se actualiza todo.
          setLoading(true);
          setError(null);
          try {
            setSession(newSession);
            await fetchProfile(newSession?.user ?? null);
            setIsLoaded(true);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Fallo al manejar cambio de autenticación';
            void logger.error('AUTH_STATE_CHANGE_FAILED', msg);
            setError('Ocurrió un problema actualizando tu sesión.');
          } finally {
            setLoading(false);
          }
        }
      );
      
      return subscription;
    };

  const subscriptionPromise = initializeAndListen();

    // Limpiamos la suscripción al final.
    return () => {
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

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  };

  const retryInit = async () => {
    // ✅ Mejora: permitir reintento desde ErrorScreen
    hasInitialized.current = false;
    setError(null);
    setIsLoaded(false);
    setLoading(true);
    try {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      await fetchProfile(initialSession?.user ?? null);
      setIsLoaded(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fallo reintentando autenticación';
      void logger.error('AUTH_RETRY_FAILED', msg);
      setError('No pudimos reintentar la inicialización.');
    } finally {
      setLoading(false);
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