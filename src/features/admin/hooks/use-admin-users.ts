// src/features/admin/hooks/use-admin-users.ts

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { AdminUser } from '../../../types/admin';

/**
 * Estado retornado por el hook useAdminUsers.
 */
interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar la obtención y actualización de usuarios.
 * Encapsula la lógica de comunicación con Supabase y manejo de errores.
 * 
 * @returns Estado de usuarios, loading y función de refetch
 * 
 * @example
 * ```tsx
 * const { users, loading, fetchUsers } = useAdminUsers();
 * 
 * // Refetch después de actualizar
 * await fetchUsers();
 * ```
 */
export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Error al cargar los usuarios.', { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  return { users, loading, fetchUsers };
}
