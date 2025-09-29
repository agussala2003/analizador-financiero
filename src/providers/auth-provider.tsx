// src/providers/auth-provider.tsx

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { Auth, Profile } from '../types/auth';
import { logger } from '../lib/logger';
import { toast } from 'sonner';

export const AuthContext = createContext<Auth | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasInitialized = useRef(false); // La clave para evitar doble ejecución

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data ?? null);
    } catch (error: any) {
      logger.error('AUTH_PROFILE_FETCH_FAILED', error.message);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Gracias al useRef, todo este bloque solo se ejecutará UNA VEZ.
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAndListen = async () => {
      // 1. Carga la sesión inicial de forma silenciosa.
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      await fetchProfile(initialSession?.user ?? null);
      setIsLoaded(true);

      // 2. Se suscribe a los cambios de autenticación.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          // Cada vez que la sesión cambie (login/logout), se actualiza todo.
          setSession(newSession);
          await fetchProfile(newSession?.user ?? null);
          setIsLoaded(true);
        }
      );
      
      return subscription;
    };

    const subscriptionPromise = initializeAndListen();

    // Limpiamos la suscripción al final.
    return () => {
      subscriptionPromise.then(subscription => subscription?.unsubscribe());
    };
  }, [fetchProfile]);

  const signOut = async () => {
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

  const value: Auth = {
    session,
    user: session?.user ?? null,
    profile,
    isLoaded,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};