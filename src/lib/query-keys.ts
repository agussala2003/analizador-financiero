// src/lib/query-keys.ts

/**
 * Query Key Factory
 * 
 * Centraliza todas las query keys de la aplicación para:
 * - Garantizar consistencia en los nombres
 * - Facilitar la invalidación de queries relacionadas
 * - Mejorar la deduplicación automática
 * - Proporcionar type safety
 * 
 * Patrón recomendado por TanStack Query:
 * https://tkdodo.eu/blog/effective-react-query-keys
 */

export const queryKeys = {
  // Assets (tickers, stocks, etc.)
  assets: {
    all: ['assets'] as const,
    lists: () => [...queryKeys.assets.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.assets.lists(), filters] as const,
    details: () => [...queryKeys.assets.all, 'detail'] as const,
    detail: (symbol: string) => [...queryKeys.assets.details(), symbol] as const,
    quote: (symbol: string) => [...queryKeys.assets.detail(symbol), 'quote'] as const,
    profile: (symbol: string) => [...queryKeys.assets.detail(symbol), 'profile'] as const,
    financials: (symbol: string) => [...queryKeys.assets.detail(symbol), 'financials'] as const,
    historicalPrice: (symbol: string, timeframe?: string) => 
      [...queryKeys.assets.detail(symbol), 'historical', timeframe ?? 'all'] as const,
    metrics: (symbol: string) => [...queryKeys.assets.detail(symbol), 'metrics'] as const,
    keyMetrics: (symbols: string[]) => [...queryKeys.assets.all, 'key-metrics', symbols] as const,
  },

  // Portfolio
  portfolio: {
    all: ['portfolio'] as const,
    holdings: (userId?: string) => [...queryKeys.portfolio.all, 'holdings', userId] as const,
    transactions: (userId?: string) => [...queryKeys.portfolio.all, 'transactions', userId] as const,
    performance: (userId?: string) => [...queryKeys.portfolio.all, 'performance', userId] as const,
    summary: (userId?: string) => [...queryKeys.portfolio.all, 'summary', userId] as const,
  },

  // Watchlist
  watchlist: {
    all: ['watchlist'] as const,
    list: (userId?: string) => [...queryKeys.watchlist.all, 'list', userId] as const,
    item: (symbol: string, userId?: string) => [...queryKeys.watchlist.all, 'item', symbol, userId] as const,
    isInWatchlist: (symbol: string, userId?: string) => [...queryKeys.watchlist.all, 'check', symbol, userId] as const,
  },

  // Dividends
  dividends: {
    all: ['dividends'] as const,
    calendar: (filters?: Record<string, unknown>) => 
      [...queryKeys.dividends.all, 'calendar', filters] as const,
    history: (symbol: string) => [...queryKeys.dividends.all, 'history', symbol] as const,
  },

  // News
  news: {
    all: ['news'] as const,
    general: (params?: Record<string, unknown>) => [...queryKeys.news.all, 'general', params] as const,
    bySymbol: (symbol: string) => [...queryKeys.news.all, 'symbol', symbol] as const,
  },

  // User & Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: (userId?: string) => [...queryKeys.auth.all, 'profile', userId] as const,
  },

  // Config
  config: {
    all: ['config'] as const,
    app: () => [...queryKeys.config.all, 'app'] as const,
    sidebar: () => [...queryKeys.config.all, 'sidebar'] as const,
  },
} as const;

/**
 * Helper para invalidar todas las queries de un asset
 */
export const invalidateAsset = (symbol: string) => {
  return queryKeys.assets.detail(symbol);
};

/**
 * Helper para invalidar todo el portfolio de un usuario
 */
export const invalidatePortfolio = (userId?: string) => {
  return queryKeys.portfolio.holdings(userId);
};

/**
 * Helper para invalidar watchlist de un usuario
 */
export const invalidateWatchlist = (userId?: string) => {
  return queryKeys.watchlist.list(userId);
};
