// src/features/admin/lib/admin-utils.ts

import type { LogLevelVariant, UserRoleVariant } from '../types/admin-local.types';

/**
 * Retorna la variante de badge apropiada según el nivel de log.
 * @param level - Nivel del log (INFO, WARN, ERROR, DEBUG)
 * @returns Variante del badge para el componente Badge de shadcn
 * 
 * @example
 * ```tsx
 * <Badge variant={getLogLevelVariant('ERROR')}>ERROR</Badge>
 * ```
 */
export function getLogLevelVariant(level: string): LogLevelVariant {
  switch (level?.toUpperCase()) {
    case 'ERROR':
      return 'destructive';
    case 'WARN':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Retorna la variante de badge apropiada según el rol del usuario.
 * @param role - Rol del usuario (basico, plus, premium, administrador)
 * @returns Variante del badge para el componente Badge de shadcn
 * 
 * @example
 * ```tsx
 * <Badge variant={getUserRoleVariant('administrador')}>Admin</Badge>
 * ```
 */
export function getUserRoleVariant(role: string): UserRoleVariant {
  return role === 'administrador' ? 'default' : 'secondary';
}

/**
 * Formatea una fecha ISO en formato localizado español.
 * @param isoDate - Fecha en formato ISO string
 * @returns Fecha formateada en español con hora 24h
 * 
 * @example
 * ```tsx
 * formatLogDate('2025-10-12T15:30:00Z') // "12/10/2025, 15:30:00"
 * ```
 */
export function formatLogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-ES', { hour12: false });
}
