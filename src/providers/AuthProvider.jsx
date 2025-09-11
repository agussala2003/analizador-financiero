// src/context/AuthContext.jsx
import { useState, useEffect, useCallback } from 'react';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AuthContext } from '../context/authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Nueva función de fetch de perfil, reutilizable
  const fetchProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    // ✅ Seleccionamos explícitamente los campos, incluyendo los nuevos del onboarding
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*, onboarding_completed, onboarding_step, onboarding_profile')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('AUTH_PROFILE_FETCH_FAILED', 'Error al obtener perfil del usuario', {
        userId: user.id,
        error: profileError.message
      });
      setProfile(null);
      return null;
    } else {
      logger.info('AUTH_PROFILE_LOADED', 'Perfil del usuario cargado exitosamente', {
        userId: user.id,
        userRole: profileData?.role,
        onboardingCompleted: profileData?.onboarding_completed
      });
      setProfile(profileData);
      return profileData;
    }
  }, []);

  useEffect(() => {
    const setData = async () => {
      logger.info('AUTH_SESSION_INIT_START', 'Iniciando obtención de sesión inicial');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('AUTH_SESSION_INIT_FAILED', 'Error al obtener sesión inicial', { error: error.message });
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('AUTH_STATE_CHANGED', 'Estado de autenticación cambió', { event, hasSession: !!session });
      setSession(session);
      await fetchProfile(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    logger.info('AUTH_PROFILE_REFRESH_START', 'Iniciando actualización manual del perfil', { userId: session.user.id });
    await fetchProfile(session.user);
  }, [session, fetchProfile]);

  const signOut = async () => {
    try {
      logger.info('AUTH_SIGNOUT_START', 'Iniciando proceso de cerrar sesión');
      setSession(null);
      setProfile(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(`Error al cerrar sesión: ${error.message}`);
      logger.info('AUTH_SIGNOUT_SUCCESS', 'Sesión cerrada exitosamente');
      setTimeout(() => { window.location.href = '/'; }, 100);
    } catch (error) {
      logger.error('AUTH_SIGNOUT_FAILED', 'Fallo crítico al cerrar sesión', { error: error.message });
      setTimeout(() => { window.location.href = '/'; }, 500);
      throw error;
    }
  };

  const value = {
    session,
    user: session?.user,
    profile,
    loading,
    refreshProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? ( <Loader size='32' fullScreen overlay message="Conectando con el servidor..." /> ) : ( children )}
    </AuthContext.Provider>
  );
}