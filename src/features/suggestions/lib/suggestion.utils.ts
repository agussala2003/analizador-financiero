// src/features/suggestions/lib/suggestion.utils.ts

import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/logger';
import { errorToString } from '../../../utils/type-guards';
import { Suggestion, SuggestionStatus, StatusConfig, SuggestionsConfig } from '../types/suggestion.types';

/**
 * Status configuration mapping
 */
export const STATUS_CONFIG: Record<SuggestionStatus, StatusConfig> = {
  nueva: { label: 'Nueva', variant: 'default', icon: null },
  'en revisión': { label: 'En revisión', variant: 'secondary', icon: null },
  completada: { label: 'Completada', variant: 'secondary', icon: '✅' },
  rechazada: { label: 'Rechazada', variant: 'destructive', icon: '❌' },
  planeada: { label: 'Planeada', variant: 'outline', icon: '📅' },
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: SuggestionsConfig = {
  minLength: 10,
  maxLength: 500,
};

/**
 * Extracts suggestions configuration from raw config object
 */
export function extractSuggestionsConfig(raw: unknown): SuggestionsConfig {
  if (
    raw &&
    typeof raw === 'object' &&
    'minLength' in raw &&
    typeof (raw as Record<string, unknown>).minLength === 'number' &&
    'maxLength' in raw &&
    typeof (raw as Record<string, unknown>).maxLength === 'number'
  ) {
    return {
      minLength: (raw as { minLength: number }).minLength,
      maxLength: (raw as { maxLength: number }).maxLength,
    };
  }
  return DEFAULT_CONFIG;
}

/**
 * Validates suggestion content against config rules
 */
export function validateSuggestionContent(
  content: string,
  config: SuggestionsConfig
): { valid: boolean; error?: string } {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'La sugerencia no puede estar vacía.' };
  }

  if (trimmed.length < config.minLength) {
    return {
      valid: false,
      error: `Tu sugerencia debe tener al menos ${config.minLength} caracteres.`,
    };
  }

  if (trimmed.length > config.maxLength) {
    return {
      valid: false,
      error: `Tu sugerencia no puede exceder ${config.maxLength} caracteres.`,
    };
  }

  return { valid: true };
}

/**
 * Checks if content is over character limit
 */
export function isOverLimit(content: string, maxLength: number): boolean {
  return content.length > maxLength;
}

/**
 * Checks if content is under minimum length (but not empty)
 */
export function isUnderMinimum(content: string, minLength: number): boolean {
  return content.length > 0 && content.length < minLength;
}

/**
 * Formats date for display
 */
export function formatSuggestionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Fetches user suggestions from Supabase
 */
export async function fetchUserSuggestions(userId: string): Promise<Suggestion[]> {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(errorToString(error));
    }

    void logger.info('SUGGESTIONS_FETCHED', 'User suggestions fetched successfully.');
    return (data as Suggestion[]) ?? [];
  } catch (error) {
    void logger.error('SUGGESTIONS_FETCH_FAILED', errorToString(error));
    throw error;
  }
}

/**
 * Submits a new suggestion to Supabase
 */
export async function submitSuggestion(
  content: string,
  userId: string
): Promise<Suggestion> {
  try {
    const result = await supabase
      .from('suggestions')
      .insert({ content: content.trim(), user_id: userId })
      .select()
      .single();

    if (result.error) {
      throw new Error(errorToString(result.error));
    }

    const data = result.data as Suggestion;

    void logger.info('SUGGESTION_SUBMITTED', 'Suggestion submitted successfully.', {
      suggestionId: data.id,
    });

    return data;
  } catch (error) {
    void logger.error('SUGGESTION_SUBMISSION_FAILED', errorToString(error));
    throw error;
  }
}

/**
 * Gets character count message with color indication
 */
export function getCharCountMessage(
  count: number,
  config: SuggestionsConfig
): { message: string; colorClass: string } {
  const isOver = count > config.maxLength;
  const isUnder = count > 0 && count < config.minLength;

  let colorClass = 'text-muted-foreground';
  if (isOver) colorClass = 'text-destructive';
  else if (isUnder) colorClass = 'text-yellow-500';

  const message = isOver
    ? `Máx. ${config.maxLength} caracteres`
    : `${count}/${config.maxLength}`;

  return { message, colorClass };
}

/**
 * Gets status configuration for a suggestion
 */
export function getStatusConfig(status: SuggestionStatus): StatusConfig {
  return STATUS_CONFIG[status];
}
