// src/index.js - Exportaciones centralizadas de las mejoras

import { AutoDashboardTour } from './components/onboarding/TooltipSystem';
import { preloadCache } from './enhancements';
import { useRateLimit } from './enhancements';
import { useBlogValidation } from './enhancements';
import { useProfileValidation } from './enhancements';
import { useGlobalNotifications } from './enhancements';
import { useFinancialNotifications } from './enhancements';
import { useFinancialSearch } from './enhancements';
import { useOnboarding } from './enhancements';
import { Toast } from './enhancements';
import { NotificationPanel } from './enhancements';
import { CompactSearch } from './enhancements';
import { ValidationWarning } from './enhancements';
import { ValidatedInput } from './enhancements';
import { OnboardingModal } from './enhancements';
import { RateLimitIndicator } from './enhancements';
import { AppProviders } from './enhancements';
import { UserProvider } from './enhancements';
import { ValidationRules } from './enhancements';
import { defaultConfig } from './enhancements';
import { saveConfig } from './enhancements';
import { getEnvironmentConfig } from './enhancements';
import { loadConfig } from './enhancements';
import { sanitize } from './enhancements';
import { FinancialValidators } from './enhancements';
import { ConfigProvider } from './enhancements';
import { CombinedProvider } from './enhancements';
import { TourButton } from './enhancements';
import { ContextualTooltip } from './enhancements';
import { ValidatedTextarea } from './enhancements';
import { PasswordStrengthIndicator } from './enhancements';
import { ValidationError } from './enhancements';
import { SmartSearchBox } from './enhancements';
import { NotificationBadge } from './enhancements';
import { NotificationContainer } from './enhancements';
import { useFinancialOnboarding } from './enhancements';
import { useSmartSearch } from './enhancements';
import { useFormNotifications } from './enhancements';
import { useNotifications } from './enhancements';
import { useAuthValidation } from './enhancements';
import { useValidation } from './enhancements';
import { useFinancialRateLimit } from './enhancements';
import { useFinancialCache } from './enhancements';
import { useCache } from './enhancements';

// Hooks principales
export { useCache, useFinancialCache, preloadCache } from './hooks/useCache';
export { useRateLimit, useFinancialRateLimit } from './hooks/useRateLimit';
export { useValidation, useBlogValidation, useAuthValidation, useProfileValidation } from './hooks/useValidation';
export { useNotifications, useGlobalNotifications, useFormNotifications, useFinancialNotifications } from './hooks/useNotifications';
export { useSmartSearch, useFinancialSearch } from './hooks/useSmartSearch';
export { useOnboarding, useFinancialOnboarding } from './hooks/useOnboarding';

// Componentes de UI
export { NotificationContainer, Toast, NotificationBadge, NotificationPanel } from './components/ui/NotificationSystem';
export { SmartSearchBox, CompactSearch } from './components/ui/SmartSearch';
export { ValidationError, ValidationWarning, PasswordStrengthIndicator, ContentCounter, ValidatedInput, ValidatedTextarea } from './components/ui/ValidationFeedback';
export { RateLimitIndicator } from './components/ui/RateLimitIndicator';

// Componentes de Onboarding
export { OnboardingModal } from './components/onboarding/OnboardingModal';
export { ContextualTooltip, TourButton } from './components/onboarding/TooltipSystem';

// Providers
export { CombinedProvider, AppProviders, ConfigProvider, UserProvider } from './providers/AppProviders';

// Validadores y utilidades
export { FinancialValidators, ValidationRules, sanitize } from './utils/validators';

// Configuración
export { defaultConfig, loadConfig, saveConfig, getEnvironmentConfig } from './config/appConfig';

// Sistema integrado - Exportación principal
export const FinancialAppEnhancements = {
  // Hooks de rendimiento
  cache: { useCache, useFinancialCache, preloadCache },
  rateLimit: { useRateLimit, useFinancialRateLimit },
  
  // Hooks de UX
  validation: { useValidation, useBlogValidation, useAuthValidation, useProfileValidation },
  notifications: { useNotifications, useGlobalNotifications, useFormNotifications, useFinancialNotifications },
  search: { useSmartSearch, useFinancialSearch },
  onboarding: { useOnboarding, useFinancialOnboarding },
  
  // Componentes listos para usar
  components: {
    notifications: { NotificationContainer, Toast, NotificationBadge, NotificationPanel },
    search: { SmartSearchBox, CompactSearch },
    validation: { ValidationError, ValidationWarning, PasswordStrengthIndicator, ValidatedInput, ValidatedTextarea },
    onboarding: { OnboardingModal, ContextualTooltip, AutoDashboardTour, TourButton },
    rateLimit: { RateLimitIndicator }
  },
  
  // Providers globales
  providers: { CombinedProvider, AppProviders, ConfigProvider, UserProvider },
  
  // Utilidades
  utils: { FinancialValidators, ValidationRules, sanitize },
  
  // Configuración
  config: { defaultConfig, loadConfig, saveConfig, getEnvironmentConfig }
};

export default FinancialAppEnhancements;
