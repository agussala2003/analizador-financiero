// src/lib/logger.ts

import { supabase } from './supabase';

// ✅ 1. Definimos un tipo estricto para los niveles de log.
// Esto evita errores de tipeo y habilita el autocompletado.
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

/**
 * Envía un evento de log a una función RPC de Supabase para su almacenamiento.
 * * @param level - El nivel de severidad del log (INFO, WARN, ERROR, DEBUG).
 * @param eventType - Un identificador único para el tipo de evento (ej: 'LOGIN_SUCCESS').
 * @param message - Un mensaje descriptivo del evento.
 * @param metadata - Un objeto opcional con datos adicionales en formato JSON.
 */
export const logEvent = async (
  level: LogLevel, 
  eventType: string, 
  message: string, 
  metadata: Record<string, unknown> = {}
) => {
  try {
    const { error } = await supabase.rpc('log_event', {
      p_level: level,
      p_event_type: eventType,
      p_message: message,
      p_metadata: metadata
    });

    if (error) {
      // ✅ 2. Si falla el logging, lo mostramos como una advertencia en la consola
      // para no interrumpir al usuario pero sí notificar al desarrollador.
      console.warn('Error al enviar el log a Supabase:', error);
    }
  } catch (e) {
    console.error('Error inesperado en el servicio de logger:', e);
  }
};

/**
 * Objeto `logger` con métodos de ayuda para registrar eventos con diferentes niveles de severidad.
 * Proporciona una API simple y consistente para el logging en toda la aplicación.
 */
export const logger = {
  /** Registra un evento informativo. */
  info: (eventType: string, message: string, metadata?: Record<string, unknown>) => 
    logEvent('INFO', eventType, message, metadata),

  /** Registra una advertencia. */
  warn: (eventType: string, message: string, metadata?: Record<string, unknown>) => 
    logEvent('WARN', eventType, message, metadata),
  
  /** Registra un error. */
  error: (eventType: string, message: string, metadata?: Record<string, unknown>) => 
    logEvent('ERROR', eventType, message, metadata),

  /** Registra un evento para depuración (generalmente para desarrollo). */
  debug: (eventType: string, message: string, metadata?: Record<string, unknown>) => 
    logEvent('DEBUG', eventType, message, metadata),
};