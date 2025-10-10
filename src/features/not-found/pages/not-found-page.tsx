import { NavLink } from "react-router-dom"
import { Button } from "../../../components/ui/button";
import { motion, Variants } from "framer-motion"

export default function NotFoundPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Anima los hijos en secuencia
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] } },
  };

  return (
    <section className="flex min-h-svh w-full items-center justify-center bg-background p-4">
      <motion.div
        className="mx-auto max-w-screen-sm text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
          variants={itemVariants}
        >
          404
        </motion.h1>
        <motion.p
          className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          variants={itemVariants}
        >
          Página no encontrada.
        </motion.p>
        <motion.p
          className="mb-8 text-lg text-muted-foreground"
          variants={itemVariants}
        >
          Oops! Parece que la página que buscas no existe en nuestro portafolio.
        </motion.p>
        <motion.div variants={itemVariants}>
          <NavLink to="/">
            <Button size="lg">Volver al Inicio</Button>
          </NavLink>
        </motion.div>
      </motion.div>
    </section>
  )
}