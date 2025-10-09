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