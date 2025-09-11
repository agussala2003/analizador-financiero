// src/utils/constants.js
/**
 * Application-wide constants
 */

export const PAGINATION = {
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [10, 20, 50],
  DIVIDEND_SIZE_OPTIONS: [10, 25, 50]
};

export const API_LIMITS = {
  BASIC: 20,
  PLUS: 100,
  PREMIUM: 500,
  ADMIN: Infinity
};

export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  ACCENT: '#F59E0B',
  DANGER: '#EF4444',
  GRAY: '#6B7280'
};

export const ROLES = {
  BASIC: 'basico',
  PLUS: 'plus', 
  PREMIUM: 'premium',
  ADMIN: 'administrador'
};

export const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

export const FINANCIAL_INDICATORS = {
  // Color thresholds for indicators
  PER: { green: 15, yellow: 25 },
  PRICE_TO_BOOK: { green: 1.5, yellow: 3 },
  DEBT_TO_EQUITY: { green: 0.3, yellow: 0.6 },
  ROE: { green: 15, yellow: 10 },
  CURRENT_RATIO: { green: 1.5, yellow: 1.2 }
};
