// src/services/api/apiLimiter.ts

import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../types/auth';
import { Config, RoleLimits } from '../../types/config';

// Tipo específico para los datos que obtenemos de la base de datos
interface DbProfileData {
  api_calls_made: number | null;
  last_api_call_date: string | null;
  role: Profile['role'] | null;
}

/**
 * Verifica si el usuario actual puede realizar una llamada a la API y actualiza su contador.
 * @param user - El objeto de usuario de Supabase.
 * @param profile - El perfil del usuario.
 * @param config - La configuración de la aplicación.
 * @returns {Promise<boolean>} - `true` si la llamada está permitida, `false` en caso contrario.
 */
export const checkApiLimit = async (
  user: User | null,
  profile: Profile | null,
  config: Config
): Promise<boolean> => {
  // Si no hay usuario o perfil, no se permite la llamada
  if (!user || !profile) return false;

  const today = new Date().toISOString().split('T')[0];

  // Obtenemos los datos más recientes del perfil para evitar inconsistencias
  const { data: dbProfile, error: profileError } = await supabase
    .from('profiles')
    .select('api_calls_made, last_api_call_date, role')
    .eq('id', user.id)
    .single();

  if (profileError || !dbProfile) {
    toast.error('No se pudo verificar el límite de uso de la API.');
    console.error('API Limit Check Error:', profileError);
    return false;
  }

  // Garantizar que dbProfile tenga el tipo correcto
  const typedDbProfile = dbProfile as DbProfileData;
  
  const role = typedDbProfile.role ?? profile.role;
  const limit = config.plans.roleLimits[role as keyof RoleLimits] ?? config.plans.roleLimits.basico;

  let calls = typedDbProfile.api_calls_made ?? 0;
  
  // Si la última llamada fue en un día anterior, reiniciamos el contador
  if (typedDbProfile.last_api_call_date !== today) {
    calls = 0;
  }

  // Verificamos si se ha alcanzado el límite
  if (calls >= limit) {
    toast.info('Has alcanzado el límite diario de uso de la API.', {
      description: 'Actualiza tu plan para obtener más acceso.',
    });
    return false;
  }

  // Si todo está en orden, incrementamos el contador en la base de datos
  const updateData: Partial<DbProfileData> = {
    api_calls_made: calls + 1,
    last_api_call_date: today
  };
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (updateError) {
    toast.error('No se pudo actualizar el uso de la API.');
    console.error('API Limit Update Error:', updateError);
    return false;
  }

  return true;
};