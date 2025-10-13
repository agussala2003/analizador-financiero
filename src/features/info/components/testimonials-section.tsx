// src/features/info/components/testimonials-section.tsx

import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../components/ui/carousel';
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { AnimatedSection } from './animated-section';
import type { TestimonialOpinion } from '../types/info-config.types';

/**
 * Props para el componente TestimonialsSection.
 * @property title - Título de la sección de testimonios
 * @property subtitle - Subtítulo descriptivo
 * @property testimonials - Array de testimonios de usuarios
 */
interface TestimonialsSectionProps {
  title: string;
  subtitle: string;
  testimonials: TestimonialOpinion[];
}

/**
 * Sección de testimonios de usuarios mostrados en un carrusel.
 * Cada testimonio incluye avatar, nombre, rol, calificación de 5 estrellas
 * y comentario del usuario.
 * 
 * @example
 * ```tsx
 * <TestimonialsSection
 *   title="Lo que dicen nuestros usuarios"
 *   subtitle="Experiencias reales de inversores"
 *   testimonials={[
 *     {
 *       name: "Juan Pérez",
 *       role: "Inversor",
 *       avatar: "/avatars/juan.jpg",
 *       comment: "Excelente plataforma"
 *     }
 *   ]}
 * />
 * ```
 */
export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  title, 
  subtitle, 
  testimonials 
}) => {
  return (
    <AnimatedSection className="py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{subtitle}</p>

        <Carousel className="w-full" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-4">
            {testimonials.map((opinion, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-2 h-full">
                  <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-col flex-grow p-6 text-left">
                      {/* Contenido del testimonio */}
                      <div className="flex-grow">
                        <Quote className="w-6 h-6 text-primary/50 mb-3" />
                        
                        {/* Calificación de 5 estrellas */}
                        <div className="flex mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className="text-yellow-400 fill-yellow-400 w-4 h-4" 
                            />
                          ))}
                        </div>

                        <p className="text-sm md:text-base text-foreground mb-4 italic">
                          "{opinion.comment}"
                        </p>
                      </div>

                      {/* Información del usuario */}
                      <div className="flex items-center gap-3 pt-4 border-t mt-auto">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={opinion.avatar} alt={opinion.name} />
                          <AvatarFallback>
                            {opinion.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{opinion.name}</p>
                          <p className="text-xs text-muted-foreground">{opinion.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </AnimatedSection>
  );
};
