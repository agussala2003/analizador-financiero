// src/features/not-found/types/not-found.types.ts

import { Variants } from "framer-motion";

/**
 * Configuración de variantes para el contenedor principal
 */
export interface ContainerVariants {
  hidden: { opacity: number };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
    };
  };
}

/**
 * Variantes de animación para items individuales
 */
export type ItemVariants = Variants;
