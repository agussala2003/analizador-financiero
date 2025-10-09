// src/types/admin.ts
import { Profile } from "./auth";

/**
 * Alias para el perfil de usuario cuando se visualiza en el panel de administración.
 */
export type AdminUser = Profile;

/**
 * Define la estructura de una entrada de log del sistema.
 */
export interface AdminLog {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    event_type: string;
    message: string;
    metadata?: Record<string, any>;
    user_id?: string;
}