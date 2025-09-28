// src/lib/logger.js
import { supabase } from './supabase';

export const logEvent = async (level: string, eventType: string, message: string, metadata = {} ) => {
  try {
    const { error } = await supabase.rpc('log_event', {
      p_level: level,
      p_event_type: eventType,
      p_message: message,
      p_metadata: metadata
    });
    if (error) {
      console.error('Failed to log event:', error); // Log a la consola si falla el logging
    }
  } catch (e) {
    console.error('Error in logger:', e);
  }
};

// Funciones helpers para no escribir strings a mano
export const logger = {
  info: (eventType: string, message: string, metadata?: object) => logEvent('INFO', eventType, message, metadata),
  warn:  (eventType: string, message: string, metadata?: object) => logEvent('WARN', eventType, message, metadata),
  error:  (eventType: string, message: string, metadata?: object) => logEvent('ERROR', eventType, message, metadata),
  debug:  (eventType: string, message: string, metadata?: object) => logEvent('DEBUG', eventType, message, metadata),
};