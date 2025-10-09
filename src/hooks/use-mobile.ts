// src/hooks/use-mobile.ts

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // Punto de corte para considerar un dispositivo como móvil (tablets en vertical y móviles)

/**
 * Hook de utilidad para detectar si el ancho de la ventana actual
 * corresponde a un dispositivo móvil.
 * * @returns {boolean} - `true` si el ancho de la ventana es menor que `MOBILE_BREAKPOINT`, `false` en caso contrario.
 */
export function useIsMobile(): boolean {
  // Inicializamos el estado basado en el ancho actual de la ventana.
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    // Función que se ejecuta cada vez que cambia el tamaño de la ventana.
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Añadimos el listener para el evento 'resize'.
    window.addEventListener("resize", handleResize);

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // para evitar fugas de memoria.
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez (al montar y desmontar).

  return isMobile;
}