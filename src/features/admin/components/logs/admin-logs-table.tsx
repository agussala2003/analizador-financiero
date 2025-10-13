// src/features/admin/components/logs/admin-logs-table.tsx

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Search } from 'lucide-react';
import { useDebounce } from '../../../../hooks/use-debounce';
import { useAdminLogs } from '../../hooks/use-admin-logs';
import { useLogColumns } from './log-columns';
import { LogMetadataModal } from './log-metadata-modal';
import { DataTable } from '../../../dividends/components';
import type { AdminLog } from '../../../../types/admin';

/**
 * Componente principal de la tabla de logs del sistema en el panel de administración.
 * Incluye búsqueda, filtrado por nivel, ordenamiento y visualización de metadata.
 * 
 * Integra:
 * - Hook de datos (`useAdminLogs`)
 * - Definición de columnas (`useLogColumns`)
 * - Modal de metadata (`LogMetadataModal`)
 * - Tabla interactiva con TanStack Table
 * 
 * @example
 * ```tsx
 * <AdminLogsTable />
 * ```
 */
export function AdminLogsTable() {
  const { logs, loading, levelFilter, setLevelFilter } = useAdminLogs();
  const [filter, setFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [viewingLog, setViewingLog] = useState<AdminLog | null>(null);

  const debouncedFilter = useDebounce(filter, 300);

  const columns = useLogColumns({
    onViewMetadata: setViewingLog,
  });

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
      globalFilter: debouncedFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Visor de Logs del Sistema ({logs.length} registros)
          </CardTitle>
          <CardDescription>
            Explora los eventos registrados para monitoreo y depuración.
          </CardDescription>

          {/* Barra de búsqueda y filtro de nivel */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mensaje, tipo de evento, etc..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            table={table}
            totalPages={table.getPageCount()}
            currentPage={table.getState().pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </CardContent>
      </Card>

      {/* Modal de metadata */}
      <LogMetadataModal
        isOpen={!!viewingLog}
        onClose={() => setViewingLog(null)}
        log={viewingLog}
      />
    </>
  );
}
