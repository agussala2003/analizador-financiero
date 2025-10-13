// src/features/not-found/lib/animation-config.ts

import { Variants } from "framer-motion";

/**
 * Variantes de animación para el contenedor de la página 404
 * Aplica animación stagger a los elementos hijos
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/**
 * Variantes de animación para items individuales
 * Fade-in con traducción vertical y easing personalizado
 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.04, 0.62, 0.23, 0.98], // Custom easing curve
    },
  },
};
