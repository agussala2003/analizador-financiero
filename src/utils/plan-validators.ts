// src/utils/plan-validators.ts

import type { Config } from '../types/config';

/**
 * Verifica si un símbolo está disponible para el plan básico.
 * Los usuarios del plan básico solo pueden acceder a símbolos populares predefinidos.
 */
export function isSymbolAvailableForBasic(symbol: string, config: Config): boolean {
  const freeTierSymbols = config.plans?.freeTierSymbols ?? [];
  return freeTierSymbols.includes(symbol.toUpperCase());
}

/**
 * Obtiene el límite de activos en seguimiento según el rol del usuario.
 */
export function getWatchlistLimit(role: string, config: Config): number {
  const validRole = role as keyof typeof config.plans.roleLimits;
  return config.plans?.roleLimits?.[validRole] ?? 5;
}

/**
 * Obtiene el límite de portfolios según el rol del usuario.
 */
export function getPortfolioLimit(role: string, config: Config): number {
  const validRole = role as keyof typeof config.plans.portfolioLimits;
  return config.plans?.portfolioLimits?.[validRole] ?? 1;
}

/**
 * Obtiene el límite de activos para comparar según el rol del usuario.
 */
export function getComparisonLimit(role: string, config: Config): number {
  const validRole = role as keyof typeof config.dashboard.maxTickersToCompare;
  return config.dashboard?.maxTickersToCompare?.[validRole] ?? 3;
}

/**
 * Verifica si un usuario puede acceder a una funcionalidad premium.
 */
export function canAccessFeature(
  userRole: string,
  requiredPlan: 'plus' | 'premium'
): boolean {
  const planHierarchy = ['basico', 'plus', 'premium', 'administrador'];
  const userIndex = planHierarchy.indexOf(userRole);
  const requiredIndex = planHierarchy.indexOf(requiredPlan);
  
  return userIndex >= requiredIndex;
}

/**
 * Obtiene el mensaje de error cuando un usuario básico intenta acceder a un símbolo restringido.
 */
export function getSymbolRestrictionMessage(symbol: string): string {
  return `El símbolo ${symbol} no está disponible en el plan Básico. Actualiza a Plus para acceder a más de 8,000 activos.`;
}

/**
 * Obtiene el próximo plan recomendado según la funcionalidad requerida.
 */
export function getRecommendedPlan(currentRole: string): 'plus' | 'premium' | null {
  if (currentRole === 'basico') return 'plus';
  if (currentRole === 'plus') return 'premium';
  return null; // Premium o administrador ya tienen acceso a todo
}
