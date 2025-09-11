// src/context/AuthContext.jsx
import { useState, useEffect } from 'react';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AuthContext } from '../context/authContext';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Usamos una sola función que maneja tanto la carga inicial como los cambios
    const setData = async () => {
      logger.info('AUTH_SESSION_INIT_START', 'Iniciando obtención de sesión inicial');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('AUTH_SESSION_INIT_FAILED', 'Error al obtener sesión inicial', {
          error: error.message,
          code: error.code
        });
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      
      if (session) {
        logger.info('AUTH_SESSION_FOUND', 'Sesión encontrada, obteniendo perfil', {
          userId: session.user.id,
          userEmail: session.user.email
        });
        
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileError) {
          logger.error('AUTH_PROFILE_FETCH_FAILED', 'Error al obtener perfil del usuario', {
            userId: session.user.id,
            error: profileError.message
          });
        } else {
          logger.info('AUTH_PROFILE_LOADED', 'Perfil del usuario cargado exitosamente', {
            userId: session.user.id,
            userRole: profileData?.role,
            canUploadBlog: profileData?.can_upload_blog
          });
        }
        setProfile(profileData);
      } else {
        logger.info('AUTH_NO_SESSION', 'No hay sesión activa');
        setProfile(null);
      }

      setLoading(false); // 👈 3. Marcamos la carga como finalizada
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info('AUTH_STATE_CHANGED', 'Estado de autenticación cambió', {
        event: event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      
      // El listener ahora solo actualiza la sesión y el perfil
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data, error }) => {
          if (error) {
            logger.error('AUTH_PROFILE_RELOAD_FAILED', 'Error al recargar perfil en cambio de estado', {
              userId: session.user.id,
              error: error.message
            });
          } else {
            logger.info('AUTH_PROFILE_RELOADED', 'Perfil recargado en cambio de estado', {
              userId: session.user.id,
              userRole: data?.role
            });
          }
          setProfile(data);
        });
      } else {
        logger.info('AUTH_SESSION_ENDED', 'Sesión terminada, limpiando perfil');
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    
    logger.info('AUTH_PROFILE_REFRESH_START', 'Iniciando actualización manual del perfil', {
      userId: session.user.id
    });
    
    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (error) {
      logger.error('AUTH_PROFILE_REFRESH_FAILED', 'Error al actualizar perfil manualmente', {
        userId: session.user.id,
        error: error.message
      });
    } else {
      logger.info('AUTH_PROFILE_REFRESH_SUCCESS', 'Perfil actualizado manualmente', {
        userId: session.user.id,
        userRole: profileData?.role
      });
      setProfile(profileData);
    }
  };

  const value = {
    session,
    user: session?.user,
    profile,
    loading, // 👈 4. Exponemos el estado de carga
    refreshProfile,
    signOut: () => {
      logger.info('AUTH_SIGNOUT_TRIGGERED', 'Usuario cerrando sesión', {
        userId: session?.user?.id
      });
      return supabase.auth.signOut();
    },
  };

  return (
  <AuthContext.Provider value={value}>
    {loading ? ( <Loader size='32' fullScreen overlay message="Conectando con el servidor..." /> ) : ( children )}
  </AuthContext.Provider>
);
}