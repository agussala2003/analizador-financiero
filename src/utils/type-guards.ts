// agussala2003/analizador-financiero/analizador-financiero-new-ui/src/utils/type-guards.ts

import { NewsItem } from '../types/news';
import { Dividend } from '../features/dividends/components';

/**
 * Verifica si un objeto desconocido es un error con una propiedad 'message'.
 * @param error El objeto a verificar.
 * @returns `true` si es un error con mensaje, `false` en caso contrario.
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    // Aserción de tipo para TypeScript
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Convierte un error de tipo `unknown` a un string de forma segura.
 * @param error El error a convertir.
 * @returns Un string representando el error.
 */
export function errorToString(error: unknown): string {
    if (isErrorWithMessage(error)) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    try {
        const stringified = JSON.stringify(error);
        // JSON.stringify returns undefined for undefined values
        if (stringified === undefined) {
            return 'Ocurrió un error desconocido e inserializable.';
        }
        return stringified;
    } catch {
        return 'Ocurrió un error desconocido e inserializable.';
    }
}

/**
 * Verifica si un objeto es un item de noticia válido.
 * @param obj El objeto a verificar.
 * @returns `true` si es un NewsItem.
 */
export function isNewsItem(obj: unknown): obj is NewsItem {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return (
        typeof o.newsURL === 'string' &&
        typeof o.newsTitle === 'string' &&
        typeof o.publishedDate === 'string' &&
        typeof o.symbol === 'string'
    );
}

/**
 * Verifica si un objeto es un dividendo válido.
 * @param obj El objeto a verificar.
 * @returns `true` si es un Dividend.
 */
export function isDividend(obj: unknown): obj is Dividend {
    if (typeof obj !== 'object' || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
        typeof o.symbol === 'string' &&
        typeof o.paymentDate === 'string' &&
        typeof o.frequency === 'string'
    );
}