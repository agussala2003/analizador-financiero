// src/features/info/components/features-section.tsx

import React, { useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { AnimatedSection } from './animated-section';
import { FeatureCard } from './feature-card';
import { getIcon } from '../lib/icon-map';
import type { FeatureItem } from '../types/info-config.types';

/**
 * Props para el componente FeaturesSection.
 * @property title - Título de la sección (puede incluir HTML)
 * @property subtitle - Subtítulo descriptivo
 * @property features - Array de características a mostrar
 */
interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

/**
 * Sección de características del producto mostradas en un carrusel interactivo.
 * Incluye autoplay que se pausa al hacer hover y es responsive (1 columna en móvil,
 * 2 en tablet, 3 en desktop).
 * 
 * @example
 * ```tsx
 * <FeaturesSection
 *   title="<span class='highlight'>Características</span> Principales"
 *   subtitle="Todo lo que necesitas para invertir mejor"
 *   features={[
 *     { icon: "Brain", title: "IA", description: "Análisis inteligente" },
 *     // ...más características
 *   ]}
 * />
 * ```
 */
export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  title, 
  subtitle, 
  features 
}) => {
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  return (
    <AnimatedSection className="py-8 px-4 sm:py-10 md:py-12 bg-muted/30">
      <div className="max-w-6xl mx-auto text-center">
        {/* Título con soporte para HTML */}
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2" 
          dangerouslySetInnerHTML={{ __html: title }} 
        />
        
        <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 max-w-full sm:max-w-xl mx-auto px-2 leading-relaxed">
          {subtitle}
        </p>

        {/* Carrusel de características */}
        <Carousel
          className="w-full"
          opts={{ align: "start", loop: true }}
          plugins={[autoplayPlugin.current]}
          onMouseEnter={() => autoplayPlugin.current.stop()}
          onMouseLeave={() => autoplayPlugin.current.reset()}
        >
          <CarouselContent className="-ml-2 sm:-ml-4">
            {features.map((feature, index) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <CarouselItem key={index} className="pl-2 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <FeatureCard
                      icon={IconComponent}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </AnimatedSection>
  );
};
