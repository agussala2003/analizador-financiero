import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useConfig } from '../../hooks/use-config';
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Brain, ChartArea, Coins, GitCompare, Heart, Newspaper, Radar, Star, Unlock, Quote } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { motion } from 'framer-motion';
import Autoplay from "embla-carousel-autoplay";

// --- MAPA DE ÍCONOS (sin cambios) ---
const iconMap: { [key: string]: React.ReactNode } = {
  Brain: <Brain className="w-6 h-6 text-primary" />,
  ChartArea: <ChartArea className="w-6 h-6 text-primary" />,
  Coins: <Coins className="w-6 h-6 text-primary" />,
  GitCompare: <GitCompare className="w-6 h-6 text-primary" />,
  Heart: <Heart className="w-6 h-6 text-primary" />,
  Newspaper: <Newspaper className="w-6 h-6 text-primary" />,
  Radar: <Radar className="w-6 h-6 text-primary" />,
  Unlock: <Unlock className="w-6 h-6 text-primary" />,
};

// --- COMPONENTES AUXILIARES (sin cambios de funcionalidad) ---
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-[1px] rounded-xl bg-background from-border/50 to-transparent h-full">
    <div className="bg-background backdrop-blur-sm h-full p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-block p-3 rounded-lg bg-muted/50 border border-border/50">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

// Componente para la animación de entrada de cada sección
const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.2 }}
  >
    {children}
  </motion.section>
);

export default function InfoPage() {
  const { user } = useAuth();
  const config = useConfig();
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  if (!config) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  const { infoPage } = config;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <main className="flex-grow">
        
        {/* --- Hero Section --- */}
        <section className="relative text-center py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {infoPage.hero.title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {infoPage.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="text-lg py-3 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                {user ? infoPage.hero.cta.loggedIn : infoPage.hero.cta.loggedOut}
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* --- Features Section (con Carrusel) --- */}
        <AnimatedSection className="py-20 md:py-28 px-4 bg-muted/40">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: infoPage.features.title }} />
            <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">{infoPage.features.subtitle}</p>
            
            <Carousel
              className="w-full"
              opts={{ align: "start", loop: true }}
              plugins={[autoplayPlugin.current]}
              onMouseEnter={() => autoplayPlugin.current.stop()}
              onMouseLeave={() => autoplayPlugin.current.reset()}
            >
              <CarouselContent className="-ml-4">
                {infoPage.features.items.map((feature: { icon: string; title: string; description: string }, index: number) => {
                  const IconComponent = iconMap[feature.icon] || <ChartArea className="w-6 h-6 text-primary" />;
                  return (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
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

        {/* --- Testimonial Section --- */}
        <AnimatedSection className="py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{infoPage.testimonial.title}</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">{infoPage.testimonial.subtitle}</p>
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-4">
                {infoPage.testimonial.opinions.map((opinion: { name: string; role: string; avatar: string; comment: string }, index: number) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-2 h-full">
                      <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col flex-grow p-8 text-left">
                          <div className="flex-grow">
                            <Quote className="w-8 h-8 text-primary/50 mb-4" />
                            <div className="flex mb-4">
                              {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400 w-5 h-5" />)}
                            </div>
                            <p className="text-base text-foreground mb-6 italic">"{opinion.comment}"</p>
                          </div>
                          <div className="flex items-center gap-4 pt-6 border-t mt-auto">
                            <Avatar>
                              <AvatarImage src={opinion.avatar} alt={opinion.name} />
                              <AvatarFallback>{opinion.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{opinion.name}</p>
                              <p className="text-sm text-muted-foreground">{opinion.role}</p>
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

        {/* --- Final CTA Section --- */}
        <AnimatedSection className="py-20 md:py-28 px-4 bg-muted/40">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/80 to-cyan-400/80 p-1 rounded-2xl">
             <div className="bg-card p-12 rounded-[15px]">
                <h2 className="text-4xl font-bold mb-4">{infoPage.finalCta.title}</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{infoPage.finalCta.subtitle}</p>
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button size="lg" className="text-xl py-4 px-10 bg-foreground text-background hover:bg-foreground/80 transition-colors">
                    {user ? infoPage.finalCta.cta.loggedIn : infoPage.finalCta.cta.loggedOut}
                  </Button>
                </Link>
             </div>
          </div>
        </AnimatedSection>

      </main>
    </div>
  );
}