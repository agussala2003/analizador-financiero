import { Profile } from "./auth";

// Reutilizamos el tipo Profile para los usuarios en el panel de admin.
export type AdminUser = Profile;

// Definimos la estructura de una entrada de log.
export interface AdminLog {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    event_type: string;
    message: string;
    metadata?: Record<string, any>;
    user_id?: string;
}