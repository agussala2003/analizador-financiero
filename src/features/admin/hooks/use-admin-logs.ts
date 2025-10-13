// src/features/admin/hooks/use-admin-logs.ts

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { AdminLog } from '../../../types/admin';

/**
 * Estado retornado por el hook useAdminLogs.
 */
interface UseAdminLogsReturn {
  logs: AdminLog[];
  loading: boolean;
  levelFilter: string;
  setLevelFilter: (level: string) => void;
}

/**
 * Hook personalizado para gestionar la obtención y filtrado de logs del sistema.
 * Encapsula la lógica de comunicación con Supabase y filtrado por nivel.
 * 
 * @returns Estado de logs, loading, nivel de filtro y setter
 * 
 * @example
 * ```tsx
 * const { logs, loading, levelFilter, setLevelFilter } = useAdminLogs();
 * 
 * // Cambiar filtro
 * setLevelFilter('ERROR');
 * ```
 */
export function useAdminLogs(): UseAdminLogsReturn {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let query = supabase.from('logs').select('*');
        
        if (levelFilter && levelFilter !== 'all') {
          query = query.eq('level', levelFilter);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(1000);

        if (error) throw error;
        setLogs(data ?? []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error('Error al cargar los logs.', { description: message });
      } finally {
        setLoading(false);
      }
    };

    void fetchLogs();
  }, [levelFilter]);

  return { logs, loading, levelFilter, setLevelFilter };
}
