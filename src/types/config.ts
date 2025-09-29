import { Profile } from "./auth";

export interface Config {
  useMockData: boolean;
  app: App;
  api: Api;
  plans: Plans;
  notifications: Notification[];
  dashboard: Dashboard;
  news: News;
  suggestions: Suggestions;
  admin: Admin;
  dividends: Dividends;
  infoPage: InfoPage;
  authPages: AuthPages;
  sidebar: {
    groups: SidebarGroup[];
  };
}

export interface Admin {
  pageSizeOptions: number[];
}

export interface Api {
  fmpProxyEndpoints: FmpProxyEndpoints;
}

export interface FmpProxyEndpoints {
  profile: string;
  keyMetrics: string;
  quote: string;
  historical: string;
  priceTarget: string;
  newsPriceTarget: string;
  newsGrades: string;
  dividendsCalendar: string;
  marketRiskPremium: string;
  dcf: string;
  rating: string;
  revenueGeographic: string; // <-- AÑADIR ESTA LÍNEA
  revenueProduct: string;    // <-- AÑADIR ESTA LÍNEA
}

export interface App {
  name: string;
  version: string;
  contactEmail: string;
}

export interface AuthPages {
  login: AuthPageContent;
  register: RegisterPageContent;
  resetPassword: ResetPasswordPageContent;
}

export interface AuthPageContent {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  forgotPassword?: string; // Opcional, solo en login
  noAccount?: string;      // Opcional, solo en login
  signUp?: string;         // Opcional, solo en login
}

export interface RegisterPageContent extends Omit<AuthPageContent, 'forgotPassword' | 'noAccount' | 'signUp'> {
  confirmPasswordPlaceholder: string;
  haveAccount: string;
  login: string;
}

export interface ResetPasswordPageContent extends Omit<AuthPageContent, 'passwordPlaceholder' | 'forgotPassword' | 'noAccount' | 'signUp'> {
  backToLogin: string;
}

export interface Dashboard {
  maxTickersToCompare: RoleLimits;
}

export interface RoleLimits {
  basico: number;
  plus: number;
  premium: number;
  administrador: number;
}

export interface Dividends {
  pageSizeOptions: number[];
}

export interface InfoPage {
  hero: Hero;
  features: Features;
  testimonial: Testimonial;
  finalCta: FinalCta;
}

export interface Features {
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FinalCta {
  title: string;
  subtitle: string;
  cta: Cta;
}

export interface Cta {
  loggedIn: string;
  loggedOut: string;
}

export interface Hero {
  title: string;
  subtitle: string;
  cta: Cta;
}

export interface Testimonial {
  title: string;
  subtitle: string;
  opinions: Opinion[];
}

export interface Opinion {
  name: string;
  role: string;
  avatar: string;
  comment: string;
}

export interface News {
  pageSize: number;
  defaultLimit: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
}

export interface Plans {
  roleLimits: RoleLimits;
  portfolioLimits: RoleLimits;
  freeTierSymbols: string[];
}

export interface Suggestions {
  minLength: number;
}

export interface SidebarLink {
  to: string;
  label: string;
  icon: string; 
  requiresAuth?: boolean;
  requiresRole?: string;
  requiresPermission?: keyof Profile;
}

export interface SidebarGroup {
  label: string;
  items: SidebarLink[];
}