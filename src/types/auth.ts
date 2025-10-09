// src/types/auth.ts
import { Session, User } from "@supabase/supabase-js";

/**
 * Representa el perfil de un usuario almacenado en la base de datos.
 * Contiene información personal, rol, permisos y estado de onboarding.
 */
export interface Profile {
    id: string;
    email: string;
    role: 'basico' | 'plus' | 'premium' | 'administrador';
    api_calls_made: number;
    last_api_call_date: Date;
    first_name: string | null;
    last_name: string | null;
    can_upload_blog: boolean;
    onboarding_completed: boolean;
    onboarding_step: number;
  // ✅ Mejora: Evitar `any` usando `unknown` para mantener seguridad de tipos
  onboarding_profile: Record<string, unknown>; // Perfil de inversor, intereses, etc.
}

/**
 * Define la estructura del contexto de autenticación global.
 */
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  // ✅ Mejora: estados explícitos de carga y error para evitar pantallas en blanco y facilitar la UI
  isLoaded: boolean; // legacy flag para compatibilidad hacia atrás
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}