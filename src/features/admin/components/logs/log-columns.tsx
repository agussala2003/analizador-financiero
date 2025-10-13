// src/features/admin/components/logs/log-columns.tsx

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ArrowUpDown, Eye } from 'lucide-react';
import { getLogLevelVariant, formatLogDate } from '../../lib/admin-utils';
import type { AdminLog } from '../../../../types/admin';

/**
 * Props para el hook useLogColumns.
 * @property onViewMetadata - Callback cuando se presiona el botón de ver metadata
 */
interface UseLogColumnsProps {
  onViewMetadata: (log: AdminLog) => void;
}

/**
 * Hook que retorna la definición de columnas para la tabla de logs.
 * Encapsula la lógica de renderizado y ordenamiento de cada columna.
 * 
 * @param props - Callbacks para acciones de la tabla
 * @returns Array de definiciones de columnas para TanStack Table
 * 
 * @example
 * ```tsx
 * const columns = useLogColumns({ onViewMetadata: setViewingLog });
 * const table = useReactTable({ data: logs, columns, ... });
 * ```
 */
export function useLogColumns({ onViewMetadata }: UseLogColumnsProps) {
  return useMemo<ColumnDef<AdminLog>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => formatLogDate(getValue() as string),
      },
      {
        accessorKey: 'level',
        header: 'Nivel',
        cell: ({ getValue }) => {
          const level = getValue() as string;
          return (
            <Badge variant={getLogLevelVariant(level)}>
              {level}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'event_type',
        header: 'Tipo de Evento',
      },
      {
        accessorKey: 'message',
        header: 'Mensaje',
        cell: ({ getValue }) => (
          <p className="max-w-xs truncate">{getValue() as string}</p>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Metadata</div>,
        cell: ({ row }) => {
          const hasMetadata =
            row.original.metadata &&
            Object.keys(row.original.metadata).length > 0;

          return (
            <div className="text-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewMetadata(row.original)}
                disabled={!hasMetadata}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onViewMetadata]
  );
}
