// src/config/supabaseIntegration.js

/**
 * Guía de integración con Supabase para las nuevas funcionalidades
 * 
 * Este archivo explica cómo configurar cada sistema para trabajar con Supabase
 */

// =====================================================
// 1. CONFIGURACIÓN DE CACHE CON SUPABASE
// =====================================================

/**
 * El cache se integra automáticamente con tus llamadas a Supabase.
 * 
 * Ejemplo de uso:
 */
/*
import { useCache } from '../hooks/useCache';
import { supabase } from '../lib/supabase';

function useStockData(symbol) {
  const { getCachedData, setCachedData } = useCache();
  
  const fetchStock = async () => {
    // Buscar en cache primero
    const cached = getCachedData(`stock-${symbol}`);
    if (cached) return cached;
    
    // Si no está en cache, buscar en Supabase
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('symbol', symbol)
      .single();
    
    if (data && !error) {
      // Guardar en cache por 30 segundos
      setCachedData(`stock-${symbol}`, data, 30000);
    }
    
    return data;
  };
  
  return { fetchStock };
}
*/

// =====================================================
// 2. RATE LIMITING CON SUPABASE
// =====================================================

/**
 * El rate limiting protege tanto a Supabase como a APIs externas.
 * Se basa en el rol del usuario almacenado en profiles.
 */
/*
import { useRateLimit } from '../hooks/useRateLimit';
import { useAuth } from '../hooks/useAuth';

function useProtectedAPI() {
  const { profile } = useAuth(); // Obtiene el rol desde Supabase
  const { checkRateLimit } = useRateLimit('supabase', profile?.role || 'basico');
  
  const callAPI = async () => {
    const canProceed = await checkRateLimit();
    if (!canProceed) {
      throw new Error('Límite de llamadas excedido');
    }
    
    // Hacer la llamada a Supabase
    return await supabase.from('table').select();
  };
  
  return { callAPI };
}
*/

// =====================================================
// 3. NOTIFICACIONES CON SUPABASE REALTIME
// =====================================================

/**
 * Las notificaciones se pueden integrar con Supabase Realtime
 * para notificaciones en tiempo real.
 */
/*
import { useGlobalNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';

function useRealtimeNotifications() {
  const { financial } = useGlobalNotifications();
  
  useEffect(() => {
    // Suscribirse a cambios en la tabla de alertas
    const subscription = supabase
      .channel('price_alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'price_alerts' },
        (payload) => {
          financial.priceAlert(
            payload.new.symbol,
            payload.new.current_price,
            payload.new.target_price
          );
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
*/

// =====================================================
// 4. BÚSQUEDA INTELIGENTE CON SUPABASE
// =====================================================

/**
 * La búsqueda puede usar la función de texto completo de Supabase
 */
/*
import { useFinancialSearch } from '../hooks/useSmartSearch';

function useSupabaseSearch() {
  const searchAPI = {
    searchStocks: async (query) => {
      const { data } = await supabase
        .from('stocks')
        .select('*')
        .textSearch('name', query)
        .limit(10);
      return data || [];
    },
    
    searchBlogs: async (query) => {
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .textSearch('title,content', query)
        .limit(10);
      return data || [];
    },
    
    searchNews: async (query) => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .textSearch('title,summary', query)
        .limit(10);
      return data || [];
    }
  };
  
  return useFinancialSearch(searchAPI);
}
*/

// =====================================================
// 5. ONBOARDING CON PERFILES DE SUPABASE
// =====================================================

/**
 * El onboarding guarda preferencias en la tabla profiles
 */
/*
import { useFinancialOnboarding } from '../hooks/useOnboarding';
import { useAuth } from '../hooks/useAuth';

function useSupabaseOnboarding() {
  const { user } = useAuth();
  const onboarding = useFinancialOnboarding();
  
  // Guardar progreso en Supabase
  const saveToSupabase = async (onboardingData) => {
    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        user_type: onboardingData.userProfile.type,
        interests: onboardingData.userProfile.interests,
        goals: onboardingData.userProfile.goals
      })
      .eq('id', user.id);
  };
  
  return { ...onboarding, saveToSupabase };
}
*/

// =====================================================
// 6. VALIDACIÓN CON DATOS DE SUPABASE
// =====================================================

/**
 * Las validaciones pueden verificar datos únicos en Supabase
 */
/*
import { FinancialValidators } from '../utils/validators';

const enhancedValidators = {
  ...FinancialValidators,
  
  // Validar que un ticker no exista ya
  uniqueTicker: async (ticker) => {
    const { data } = await supabase
      .from('stocks')
      .select('symbol')
      .eq('symbol', ticker.toUpperCase())
      .single();
    
    return {
      isValid: !data,
      message: data ? 'Este ticker ya existe' : null
    };
  },
  
  // Validar que el email no esté registrado
  uniqueEmail: async (email) => {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
    
    return {
      isValid: !data,
      message: data ? 'Este email ya está registrado' : null
    };
  }
};
*/

// =====================================================
// 7. CONFIGURACIÓN DE ROLES EN SUPABASE
// =====================================================

/**
 * Estructura sugerida para la tabla profiles:
 * 
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users(id) PRIMARY KEY,
 *   email TEXT,
 *   role TEXT DEFAULT 'basico' CHECK (role IN ('basico', 'premium', 'administrador')),
 *   api_calls_made INTEGER DEFAULT 0,
 *   api_calls_reset_at TIMESTAMP DEFAULT NOW(),
 *   onboarding_completed BOOLEAN DEFAULT false,
 *   user_type TEXT CHECK (user_type IN ('beginner', 'intermediate', 'advanced')),
 *   interests TEXT[],
 *   goals TEXT[],
 *   preferences JSONB DEFAULT '{}',
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * Esta estructura permite que todos los sistemas funcionen correctamente.
 */

export const SUPABASE_TABLES = {
  profiles: 'profiles',
  stocks: 'stocks',
  blogs: 'blogs',
  news: 'news',
  price_alerts: 'price_alerts',
  notifications: 'notifications',
  search_history: 'search_history'
};

export const USER_ROLES = {
  BASICO: 'basico',
  PREMIUM: 'premium',
  ADMINISTRADOR: 'administrador'
};

export const USER_TYPES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// =====================================================
// 8. POLÍTICAS RLS RECOMENDADAS
// =====================================================

/**
 * Row Level Security policies para Supabase:
 * 
 * -- Perfiles: los usuarios solo ven su propio perfil
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
 * CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
 * 
 * -- Stocks: todos pueden leer, solo admin puede escribir
 * ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Anyone can view stocks" ON stocks FOR SELECT USING (true);
 * CREATE POLICY "Only admin can modify stocks" ON stocks FOR ALL USING (
 *   EXISTS (
 *     SELECT 1 FROM profiles 
 *     WHERE profiles.id = auth.uid() 
 *     AND profiles.role = 'administrador'
 *   )
 * );
 * 
 * -- Blogs: usuarios premium+ pueden escribir
 * ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Anyone can view published blogs" ON blogs FOR SELECT USING (published = true);
 * CREATE POLICY "Users can view own blogs" ON blogs FOR SELECT USING (author_id = auth.uid());
 * CREATE POLICY "Premium users can create blogs" ON blogs FOR INSERT WITH CHECK (
 *   EXISTS (
 *     SELECT 1 FROM profiles 
 *     WHERE profiles.id = auth.uid() 
 *     AND profiles.role IN ('premium', 'administrador')
 *   )
 * );
 */
