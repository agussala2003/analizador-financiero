// src/types/config.ts

import { Profile } from "./auth";

// Interfaces específicas para el archivo de configuración `config.json`

export interface RoleLimits {
  basico: number;
  plus: number;
  premium: number;
  administrador: number;
}

export interface Plans {
  roleLimits: RoleLimits;
  portfolioLimits: RoleLimits;
  freeTierSymbols: string[];
}

export interface FmpProxyEndpoints {
  profile: string;
  keyMetrics: string;
  quote: string;
  historical: string;
  priceTarget: string;
  newsPriceTarget: string;
  newsGrades: string;
  stockGrades: string;
  dividendsCalendar: string;
  marketRiskPremium: string;
  dcf: string;
  rating: string;
  revenueGeographic: string;
  revenueProduct: string;
}

export interface SidebarLink {
  to: string;
  label: string;
  icon: string;
  requiresAuth?: boolean;
  requiresRole?: string;
  requiresPermission?: keyof Profile;
}

/**
 * Estructura principal del archivo `config.json`, que define el comportamiento de la aplicación.
 */
export interface Config {
  useMockData: boolean;
  app: {
    name: string;
    version: string;
    contactEmail: string;
    socialMedia?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  api: {
    fmpProxyEndpoints: FmpProxyEndpoints;
  };
  plans: Plans;
  dashboard: {
    maxTickersToCompare: RoleLimits;
  };
  sidebar: {
    groups: {
      label: string;
      items: SidebarLink[];
    }[];
  };
  // Puedes expandir estas secciones si necesitas un tipado más estricto para ellas.
  news: Record<string, unknown>;
  suggestions: Record<string, unknown>;
  admin: Record<string, unknown>;
  dividends: Record<string, unknown>;
  infoPage: Record<string, unknown>;
  authPages: Record<string, unknown>;
  notifications: Record<string, unknown>[];
}