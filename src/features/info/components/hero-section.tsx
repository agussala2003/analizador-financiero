// src/features/info/components/hero-section.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';

/**
 * Props para el componente HeroSection.
 * @property title - Título principal del hero
 * @property subtitle - Subtítulo o descripción
 * @property ctaText - Texto del botón de llamada a la acción
 * @property ctaLink - Ruta a la que redirige el botón CTA
 */
interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Sección hero de la landing page con título, subtítulo y CTA principal.
 * Incluye animaciones de entrada escalonadas y un fondo con gradiente radial.
 * 
 * @example
 * ```tsx
 * <HeroSection
 *   title="Bienvenido a Financytics"
 *   subtitle="Análisis financiero de nivel profesional"
 *   ctaText="Comenzar Ahora"
 *   ctaLink="/register"
 * />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink 
}) => {
  return (
    <section className="relative text-center py-16 px-4 overflow-hidden">
      {/* Fondo decorativo con gradiente radial */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* Título principal con animación */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h1>

      {/* Subtítulo con animación retrasada */}
      <motion.p
        className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {subtitle}
      </motion.p>

      {/* CTA Button con animación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link to={ctaLink}>
          <Button size="lg" className="text-base py-2.5 px-6 shadow-sm hover:shadow-md transition-shadow">
            {ctaText}
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};
