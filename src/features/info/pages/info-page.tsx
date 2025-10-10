// src/pages/InfoPage.tsx (adaptado para sidebar)


import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Brain, ChartArea, Coins, GitCompare, Heart, Newspaper, Radar, Star, Unlock, Quote } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { motion } from 'framer-motion';
import Autoplay from "embla-carousel-autoplay";

// --- TypeScript interfaces for config ---
interface InfoPageConfig {
  hero: {
    title: string;
    subtitle: string;
    cta: {
      loggedIn: string;
      loggedOut: string;
    };
  };
  features: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  testimonial: {
    title: string;
    subtitle: string;
    opinions: TestimonialOpinion[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    cta: {
      loggedIn: string;
      loggedOut: string;
    };
  };
}

interface FeatureItem {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}

interface TestimonialOpinion {
  name: string;
  role: string;
  avatar: string;
  comment: string;
}

// --- Type guards for config ---
function isFeatureItem(obj: unknown): obj is FeatureItem {
  const o = obj as Record<string, unknown>;
  return (
    typeof o === 'object' &&
    o !== null &&
    typeof o.icon === 'string' &&
    typeof o.title === 'string' &&
    typeof o.description === 'string'
  );
}

function isTestimonialOpinion(obj: unknown): obj is TestimonialOpinion {
  const o = obj as Record<string, unknown>;
  return (
    typeof o === 'object' &&
    o !== null &&
    typeof o.name === 'string' &&
    typeof o.role === 'string' &&
    typeof o.avatar === 'string' &&
    typeof o.comment === 'string'
  );
}

function isInfoPageConfig(obj: unknown): obj is InfoPageConfig {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  // hero
  const hero = o.hero as Record<string, unknown>;
  if (
    typeof hero !== 'object' || hero === null ||
    typeof hero.title !== 'string' ||
    typeof hero.subtitle !== 'string' ||
    typeof hero.cta !== 'object' || hero.cta === null
  ) return false;
  const heroCta = hero.cta as Record<string, unknown>;
  if (
    typeof heroCta.loggedIn !== 'string' ||
    typeof heroCta.loggedOut !== 'string'
  ) return false;
  // features
  const features = o.features as Record<string, unknown>;
  if (
    typeof features !== 'object' || features === null ||
    typeof features.title !== 'string' ||
    typeof features.subtitle !== 'string' ||
    !Array.isArray(features.items) ||
    !features.items.every(isFeatureItem)
  ) return false;
  // testimonial
  const testimonial = o.testimonial as Record<string, unknown>;
  if (
    typeof testimonial !== 'object' || testimonial === null ||
    typeof testimonial.title !== 'string' ||
    typeof testimonial.subtitle !== 'string' ||
    !Array.isArray(testimonial.opinions) ||
    !testimonial.opinions.every(isTestimonialOpinion)
  ) return false;
  // finalCta
  const finalCta = o.finalCta as Record<string, unknown>;
  if (
    typeof finalCta !== 'object' || finalCta === null ||
    typeof finalCta.title !== 'string' ||
    typeof finalCta.subtitle !== 'string' ||
    typeof finalCta.cta !== 'object' || finalCta.cta === null
  ) return false;
  const finalCtaCta = finalCta.cta as Record<string, unknown>;
  if (
    typeof finalCtaCta.loggedIn !== 'string' ||
    typeof finalCtaCta.loggedOut !== 'string'
  ) return false;
  return true;
}

const iconMap = {
  Brain: <Brain className="w-6 h-6 text-primary" />,
  ChartArea: <ChartArea className="w-6 h-6 text-primary" />,
  Coins: <Coins className="w-6 h-6 text-primary" />,
  GitCompare: <GitCompare className="w-6 h-6 text-primary" />,
  Heart: <Heart className="w-6 h-6 text-primary" />,
  Newspaper: <Newspaper className="w-6 h-6 text-primary" />,
  Radar: <Radar className="w-6 h-6 text-primary" />,
  Unlock: <Unlock className="w-6 h-6 text-primary" />,
} as const;


interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-[1px] rounded-xl bg-background from-border/50 to-transparent h-full">
    <div className="bg-background backdrop-blur-sm h-full p-6 rounded-xl text-left transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-block p-3 rounded-lg bg-muted/50 border border-border/50">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);


interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className }) => (
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


const InfoPage: React.FC = () => {
  const { user } = useAuth();
  const config = useConfig();
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

  // Defensive: type guard config
  if (!config || typeof config !== 'object' || config === null || !('infoPage' in config)) {
    return <div className="p-4">Cargando...</div>;
  }
  // Defensive: check infoPage type
  const infoPageRaw = (config as unknown as Record<string, unknown>).infoPage;
  if (!isInfoPageConfig(infoPageRaw)) {
    return <div className="p-4">Cargando...</div>;
  }
  const infoPage = infoPageRaw;

  return (
    <div className="flex flex-col gap-12 py-6">
      {/* Hero Section */}
      <section className="relative text-center py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {infoPage.hero.title}
        </motion.h1>
        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
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
            <Button size="lg" className="text-base py-2.5 px-6 shadow-sm hover:shadow-md transition-shadow">
              {user ? infoPage.hero.cta.loggedIn : infoPage.hero.cta.loggedOut}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <AnimatedSection className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: infoPage.features.title }} />
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">{infoPage.features.subtitle}</p>
          <Carousel
            className="w-full"
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            onMouseEnter={() => autoplayPlugin.current.stop()}
            onMouseLeave={() => autoplayPlugin.current.reset()}
          >
            <CarouselContent className="-ml-4">
              {infoPage.features.items.map((feature, index) => {
                // feature is already type FeatureItem due to type guard
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

      {/* Testimonial Section */}
      <AnimatedSection className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{infoPage.testimonial.title}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{infoPage.testimonial.subtitle}</p>
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-4">
              {infoPage.testimonial.opinions.map((opinion, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-2 h-full">
                    <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="flex flex-col flex-grow p-6 text-left">
                        <div className="flex-grow">
                          <Quote className="w-6 h-6 text-primary/50 mb-3" />
                          <div className="flex mb-3">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400 w-4 h-4" />)}
                          </div>
                          <p className="text-sm md:text-base text-foreground mb-4 italic">"{opinion.comment}"</p>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t mt-auto">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={opinion.avatar} alt={opinion.name} />
                            <AvatarFallback>{opinion.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
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

      {/* Final CTA Section */}
      <AnimatedSection className="py-12 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/80 to-cyan-400/80 p-1 rounded-xl">
          <div className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-3">{infoPage.finalCta.title}</h2>
            <p className="text-muted-foreground mb-6">{infoPage.finalCta.subtitle}</p>
            <Link to={user ? "/dashboard" : "/register"}>
              <Button size="lg" className="text-base py-2.5 px-6 bg-foreground text-background hover:bg-foreground/80 transition-colors">
                {user ? infoPage.finalCta.cta.loggedIn : infoPage.finalCta.cta.loggedOut}
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

    </div>
  );
};

export default InfoPage;