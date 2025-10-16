// src/features/info/components/final-cta-section.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { AnimatedSection } from './animated-section';

/**
 * Props para el componente FinalCtaSection.
 * @property title - Título del CTA final
 * @property subtitle - Subtítulo o descripción
 * @property ctaText - Texto del botón de acción
 * @property ctaLink - Ruta a la que redirige el botón
 */
interface FinalCtaSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Sección de llamada a la acción (CTA) final de la landing page.
 * Presenta un diseño destacado con borde gradiente para captar la atención
 * del usuario antes del final de la página.
 * 
 * @example
 * ```tsx
 * <FinalCtaSection
 *   title="¿Listo para comenzar?"
 *   subtitle="Únete a miles de inversores exitosos"
 *   ctaText="Crear Cuenta Gratis"
 *   ctaLink="/register"
 * />
 * ```
 */
export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink 
}) => {
  return (
    <AnimatedSection className="py-8 px-4 sm:py-10 md:py-12 bg-muted/30">
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/80 to-cyan-400/80 p-1 rounded-xl">
        <div className="bg-card p-5 sm:p-6 md:p-8 rounded-lg">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 px-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 px-2 leading-relaxed">{subtitle}</p>
          <Link to={ctaLink}>
            <Button 
              size="default"
              className="text-sm sm:text-base py-2 px-5 sm:py-2.5 sm:px-6 bg-foreground text-background hover:bg-foreground/80 transition-colors w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              {ctaText}
            </Button>
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
};
