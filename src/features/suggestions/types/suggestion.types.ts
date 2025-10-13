// src/features/suggestions/types/suggestion.types.ts

/**
 * Suggestion status types
 */
export type SuggestionStatus =
  | 'nueva'
  | 'en revisión'
  | 'completada'
  | 'rechazada'
  | 'planeada';

/**
 * Suggestion data from database
 */
export interface Suggestion {
  id: number;
  created_at: string;
  content: string;
  status: SuggestionStatus;
  user_id?: string;
}

/**
 * Status configuration for display
 */
export interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: string | null;
}

/**
 * Suggestions configuration from app config
 */
export interface SuggestionsConfig {
  minLength: number;
  maxLength: number;
}

/**
 * Props for suggestion card component
 */
export interface SuggestionCardProps {
  suggestion: Suggestion;
}

/**
 * Props for suggestion form component
 */
export interface SuggestionFormProps {
  config: SuggestionsConfig;
  onSubmit: (content: string) => Promise<void>;
  loading: boolean;
}

/**
 * Props for suggestions list component
 */
export interface SuggestionsListProps {
  suggestions: Suggestion[];
  loading: boolean;
}

/**
 * Props for empty state component
 */
export interface EmptySuggestionsProps {
  message?: string;
}
