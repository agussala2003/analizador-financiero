// src/features/admin/types/admin-local.types.ts

/**
 * Tipos locales específicos del feature de administración.
 * Los tipos principales (AdminUser, AdminLog) están en src/types/admin.ts
 */

/**
 * Estado de carga y error para las vistas de administración.
 */
export interface AdminViewState {
  loading: boolean;
  error: string | null;
}

/**
 * Props para filtros de búsqueda en tablas.
 */
export interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Props para filtros de nivel en logs.
 */
export interface LevelFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Variantes de badge para niveles de log.
 */
export type LogLevelVariant = "destructive" | "secondary" | "outline" | "default";

/**
 * Variantes de badge para roles de usuario.
 */
export type UserRoleVariant = "default" | "secondary";
