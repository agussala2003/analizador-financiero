// src/features/not-found/pages/not-found-page.tsx

import { NavLink } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../lib/animation-config";

/**
 * Página 404 - Not Found
 * Muestra un mensaje amigable cuando el usuario navega a una ruta inexistente
 */
export default function NotFoundPage() {
  return (
    <section className="flex min-h-svh w-full items-center justify-center bg-background p-3 sm:p-4">
      <motion.div
        className="mx-auto max-w-screen-sm text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="mb-3 sm:mb-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
          variants={itemVariants}
        >
          404
        </motion.h1>
        <motion.p
          className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          variants={itemVariants}
        >
          Página no encontrada.
        </motion.p>
        <motion.p
          className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-muted-foreground"
          variants={itemVariants}
        >
          Oops! Parece que la página que buscas no existe en nuestro portafolio.
        </motion.p>
        <motion.div variants={itemVariants}>
          <NavLink to="/">
            <Button size="sm" className="btn-press text-sm sm:text-base">Volver al Inicio</Button>
          </NavLink>
        </motion.div>
      </motion.div>
    </section>
  )
}