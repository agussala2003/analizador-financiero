// src/features/admin/components/index.ts

/**
 * Barrel export para todos los componentes del feature "admin".
 * Simplifica los imports en otros archivos.
 * 
 * @example
 * ```typescript
 * import { AdminHeader, AdminTabs } from '@/features/admin/components';
 * ```
 */

// Componentes principales
export { AdminHeader } from './admin-header';
export { AdminTabs } from './admin-tabs';

// Componentes de usuarios
export { AdminUsersTable } from './users/admin-users-table';
export { EditUserModal } from './users/edit-user-modal';
export { useUserColumns } from './users/user-columns';

// Componentes de logs
export { AdminLogsTable } from './logs/admin-logs-table';
export { LogMetadataModal } from './logs/log-metadata-modal';
export { useLogColumns } from './logs/log-columns';
