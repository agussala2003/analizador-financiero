// src/features/info/types/info-config.types.ts

/**
 * Configuración completa de la página de información/landing.
 * Esta estructura se carga desde `config.json` y define todo el contenido
 * de las secciones: hero, features, testimonials y CTA final.
 */
export interface InfoPageConfig {
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

/**
 * Representa una característica individual mostrada en el carrusel.
 * @property icon - Nombre del icono de lucide-react (ej: "Brain", "ChartArea")
 * @property title - Título de la característica
 * @property description - Descripción detallada
 */
export interface FeatureItem {
  icon: IconName;
  title: string;
  description: string;
}

/**
 * Representa un testimonio de usuario.
 * @property name - Nombre completo del usuario
 * @property role - Rol o profesión del usuario
 * @property avatar - URL del avatar
 * @property comment - Texto del testimonio
 */
export interface TestimonialOpinion {
  name: string;
  role: string;
  avatar: string;
  comment: string;
}

/**
 * Nombres válidos de iconos disponibles en el mapeo.
 */
export type IconName = 
  | 'Brain'
  | 'ChartArea'
  | 'Coins'
  | 'GitCompare'
  | 'Heart'
  | 'Newspaper'
  | 'Radar'
  | 'Unlock';
