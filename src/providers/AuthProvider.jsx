import { useState, useEffect, useCallback } from 'react';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AuthContext } from '../context/authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mantenemos fetchProfile en un useCallback por buena práctica
  const fetchProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, onboarding_completed, onboarding_step, onboarding_profile')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      logger.error('AUTH_PROFILE_FETCH_FAILED', 'Error al obtener perfil', { error: error.message });
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // --- LÓGICA DE INICIALIZACIÓN RESTAURADA ---
    // Este es el flujo que funcionaba: secuencial y seguro.
    const initializeSession = async () => {
      // 1. Obtenemos la sesión.
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('AUTH_SESSION_INIT_FAILED', 'Error al obtener sesión inicial', { error: error.message });
        setSession(null);
        setProfile(null);
        setLoading(false); // Hay un error, pero dejamos de cargar
        return;
      }

      // 2. Guardamos la sesión en el estado.
      setSession(currentSession);
      
      // 3. SI hay sesión, buscamos el perfil.
      if (currentSession) {
        await fetchProfile(currentSession.user);
      }
      
      // 4. SOLO AL FINAL de todo este proceso, quitamos el loader.
      // Esto garantiza que la app no se renderice hasta tener la info de auth.
      setLoading(false);
    };

    initializeSession();

    // --- LISTENER SIMPLIFICADO ---
    // Como en la versión que funcionaba, este listener solo se encarga
    // de actualizar la sesión en caso de LOGIN o LOGOUT.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Ya no llamamos a fetchProfile aquí para evitar la carrera.
        // Si hay un cambio de sesión (login), la app se recargará y
        // el flujo de inicialización se encargará del perfil.
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]); // La dependencia es correcta.

  // El resto de funciones se mantienen igual
  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    // Un redirect puede ser útil aquí si el router no lo maneja automáticamente
    window.location.href = '/login'; 
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
      {loading ? (
        <Loader size='32' fullScreen overlay message="Conectando..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}