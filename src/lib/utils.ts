// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina y fusiona clases de Tailwind CSS de forma inteligente y sin conflictos.
 * * @example
 * // Devuelve "bg-red-500 text-lg" (la última clase de color prevalece)
 * cn("bg-blue-500", "bg-red-500", "text-lg") 
 * * @param {...ClassValue[]} inputs - Una secuencia de clases de Tailwind.
 * @returns {string} Una cadena de texto con las clases finales fusionadas.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha a un formato legible en español.
 * 
 * @example
 * formatDate(new Date()) // "17/10 14:30"
 * formatDate("2025-10-16T10:00:00Z") // "16/10 10:00"
 * 
 * @param date - La fecha a formatear (string ISO o Date object)
 * @returns {string} Fecha formateada como "DD/MM HH:mm"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}