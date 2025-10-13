// src/features/admin/components/users/admin-users-table.tsx

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
import { Search } from 'lucide-react';
import { useDebounce } from '../../../../hooks/use-debounce';
import { useAdminUsers } from '../../hooks/use-admin-users';
import { useUserColumns } from './user-columns';
import { EditUserModal } from './edit-user-modal';
import { DataTable } from '../../../dividends/components';
import type { AdminUser } from '../../../../types/admin';

/**
 * Componente principal de la tabla de gestión de usuarios en el panel de administración.
 * Incluye búsqueda, ordenamiento, paginación y edición de usuarios.
 * 
 * Integra:
 * - Hook de datos (`useAdminUsers`)
 * - Definición de columnas (`useUserColumns`)
 * - Modal de edición (`EditUserModal`)
 * - Tabla interactiva con TanStack Table
 * 
 * @example
 * ```tsx
 * <AdminUsersTable />
 * ```
 */
export function AdminUsersTable() {
  const { users, loading, fetchUsers } = useAdminUsers();
  const [filter, setFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const debouncedFilter = useDebounce(filter, 300);

  const columns = useUserColumns({
    onEditUser: setEditingUser,
  });

  const table = useReactTable({
    data: users,
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
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios ({users.length})</CardTitle>
          <CardDescription>
            Busca, ordena y edita los perfiles de los usuarios de la plataforma.
          </CardDescription>

          {/* Barra de búsqueda */}
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nombre, rol..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
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

      {/* Modal de edición */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdate={() => {
          void fetchUsers();
        }}
      />
    </>
  );
}
