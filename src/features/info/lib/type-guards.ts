// src/features/info/lib/type-guards.ts

import type { InfoPageConfig, FeatureItem, TestimonialOpinion } from '../types/info-config.types';

/**
 * Valida si un objeto desconocido es un `FeatureItem` válido.
 * @param obj - Objeto a validar
 * @returns `true` si el objeto cumple con la estructura de `FeatureItem`
 */
export function isFeatureItem(obj: unknown): obj is FeatureItem {
  const o = obj as Record<string, unknown>;
  return (
    typeof o === 'object' &&
    o !== null &&
    typeof o.icon === 'string' &&
    typeof o.title === 'string' &&
    typeof o.description === 'string'
  );
}

/**
 * Valida si un objeto desconocido es un `TestimonialOpinion` válido.
 * @param obj - Objeto a validar
 * @returns `true` si el objeto cumple con la estructura de `TestimonialOpinion`
 */
export function isTestimonialOpinion(obj: unknown): obj is TestimonialOpinion {
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

/**
 * Valida si un objeto desconocido es una configuración válida de `InfoPageConfig`.
 * Verifica recursivamente todas las propiedades requeridas.
 * @param obj - Objeto a validar
 * @returns `true` si el objeto cumple con la estructura completa de `InfoPageConfig`
 */
export function isInfoPageConfig(obj: unknown): obj is InfoPageConfig {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;

  // Validar hero
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

  // Validar features
  const features = o.features as Record<string, unknown>;
  if (
    typeof features !== 'object' || features === null ||
    typeof features.title !== 'string' ||
    typeof features.subtitle !== 'string' ||
    !Array.isArray(features.items) ||
    !features.items.every(isFeatureItem)
  ) return false;

  // Validar testimonial
  const testimonial = o.testimonial as Record<string, unknown>;
  if (
    typeof testimonial !== 'object' || testimonial === null ||
    typeof testimonial.title !== 'string' ||
    typeof testimonial.subtitle !== 'string' ||
    !Array.isArray(testimonial.opinions) ||
    !testimonial.opinions.every(isTestimonialOpinion)
  ) return false;

  // Validar finalCta
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
