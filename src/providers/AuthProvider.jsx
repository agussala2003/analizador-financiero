// src/providers/AuthProvider.jsx
import { useState, useEffect, useCallback } from 'react';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AuthContext } from '../context/authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
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
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchProfile(session?.user);
      setLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchProfile(session?.user);
    });

    // ✅ **LA CLAVE ESTÁ AQUÍ**
    // Este listener detecta cuando la pestaña vuelve a estar visible.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Al volver a la pestaña, forzamos a Supabase a que verifique la sesión.
        // Si el token cambió, disparará onAuthStateChange y toda la app se actualizará.
        supabase.auth.getSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  const signOut = async () => {
      setSession(null);
      setProfile(null);
      await supabase.auth.signOut();
      setTimeout(() => { window.location.href = '/'; }, 100);
  };

  const value = { session, user: session?.user, profile, loading, refreshProfile, signOut };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loader size='32' fullScreen overlay message="Conectando..." /> : children}
    </AuthContext.Provider>
  );
}