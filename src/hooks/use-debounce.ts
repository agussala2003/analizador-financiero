// src/hooks/use-debounce.ts

import { useState, useEffect } from 'react';

/**
 * Hook personalizado que retrasa la actualización de un valor.
 * Es ideal para posponer operaciones costosas (como filtrados)
 * hasta que el usuario haya dejado de escribir en un input.
 *
 * @template T - El tipo de dato del valor a retrasar.
 * @param {T} value - El valor actual que se quiere "retrasar" (ej: el texto de un input).
 * @param {number} delay - El tiempo de espera en milisegundos después de que el valor deja de cambiar.
 * @returns {T} El valor retrasado.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 * // Esta lógica solo se ejecuta 500ms después de que el usuario deja de escribir.
 * api.search(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor "retrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura un temporizador para actualizar el valor debounced
    // solo después de que haya pasado el tiempo de 'delay'.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza: se ejecuta cada vez que el 'value' o 'delay' cambian.
    // Cancela el temporizador anterior para evitar que se ejecute si el usuario sigue escribiendo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}