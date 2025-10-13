// src/features/admin/components/users/user-columns.tsx

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ArrowUpDown, Edit } from 'lucide-react';
import { getUserRoleVariant } from '../../lib/admin-utils';
import type { AdminUser } from '../../../../types/admin';

/**
 * Props para el hook useUserColumns.
 * @property onEditUser - Callback cuando se presiona el botón de editar
 */
interface UseUserColumnsProps {
  onEditUser: (user: AdminUser) => void;
}

/**
 * Hook que retorna la definición de columnas para la tabla de usuarios.
 * Encapsula la lógica de renderizado y ordenamiento de cada columna.
 * 
 * @param props - Callbacks para acciones de la tabla
 * @returns Array de definiciones de columnas para TanStack Table
 * 
 * @example
 * ```tsx
 * const columns = useUserColumns({ onEditUser: setEditingUser });
 * const table = useReactTable({ data: users, columns, ... });
 * ```
 */
export function useUserColumns({ onEditUser }: UseUserColumnsProps) {
  return useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.email}</div>
        ),
      },
      {
        accessorKey: 'first_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'last_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Apellido
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Rol
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return (
            <Badge variant={getUserRoleVariant(role)} className="capitalize">
              {role}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'can_upload_blog',
        header: 'Puede Bloggear',
        cell: ({ getValue }) => (getValue() ? 'Sí' : 'No'),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Editar</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditUser(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onEditUser]
  );
}
