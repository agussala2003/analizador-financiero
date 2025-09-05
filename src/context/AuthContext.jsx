// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useError } from './ErrorContext';
import Loader from '../components/ui/Loader';
import { supabase } from '../lib/supabase';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 1. Reintroducimos el estado de carga
  const { showError } = useError();

  useEffect(() => {
    // 2. Usamos una sola función que maneja tanto la carga inicial como los cambios
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      
      if (session) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false); // 👈 3. Marcamos la carga como finalizada
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // El listener ahora solo actualiza la sesión y el perfil
      setSession(session);
      if (session) supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
       else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user,
    profile,
    loading, // 👈 4. Exponemos el estado de carga
    signOut: () => supabase.auth.signOut(),
  };

  return (
  <AuthContext.Provider value={value}>
    {loading ? ( <Loader size='32' fullScreen overlay message="Conectando con el servidor..." /> ) : ( children )}
  </AuthContext.Provider>
);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}