// src/features/info/components/feature-card.tsx

import React from 'react';

/**
 * Props para el componente FeatureCard.
 * @property icon - Elemento React que representa el icono (de lucide-react)
 * @property title - Título de la característica
 * @property description - Descripción detallada de la característica
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Tarjeta individual que muestra una característica del producto.
 * Incluye un icono, título y descripción con efectos hover suaves.
 * 
 * Se usa principalmente en el carrusel de características de la landing page.
 * 
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={<Brain className="w-6 h-6" />}
 *   title="Análisis con IA"
 *   description="Obtén insights generados por inteligencia artificial"
 * />
 * ```
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-[1px] rounded-xl bg-background from-border/50 to-transparent h-full">
    <div className="bg-background backdrop-blur-sm h-full p-4 sm:p-5 md:p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1">
      <div className="mb-3 sm:mb-4 inline-block p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);
