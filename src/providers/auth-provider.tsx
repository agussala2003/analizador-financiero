// src/components/auth-provider.tsx

import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { Auth, Profile } from '../types/auth';
import { toast } from 'sonner';

export const AuthContext = createContext<Auth | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Función que maneja la sesión: actualiza estado y carga perfil si corresponde
  const handleSessionChange = async (newSession: Session | null) => {
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        toast.error('Error cargando perfil de usuario');
        setProfile(null);
      } else {
        setProfile(data ?? null);
      }
    } catch (err) {
      toast.error('Error inesperado cargando perfil');
      setProfile(null);
    } finally {
      setIsLoaded(true);
    }
  };

  
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await handleSessionChange(data.session ?? null);
      } catch (err) {
        toast.error('Error cargando sesión inicial');
        setIsLoaded(true);
      }

      const { data: listenerData } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          await handleSessionChange(newSession ?? null);
        }
      );

      subscription = (listenerData as any)?.subscription ?? null;
    })();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    toast.loading('Cerrando sesión...');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoaded(true);
    toast.success('Sesión cerrada');
  };

  const refreshProfile = async () => {
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
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
    }
  };

  const value: Auth = {
    session,
    user,
    profile,
    isLoaded,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
