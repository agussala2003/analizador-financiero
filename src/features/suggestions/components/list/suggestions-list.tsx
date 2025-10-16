// src/features/suggestions/components/list/suggestions-list.tsx

import { AnimatePresence } from 'framer-motion';
import { SuggestionsListProps } from '../../types/suggestion.types';
import { SuggestionCard } from '../card/suggestion-card';
import { EmptySuggestions } from '../empty/empty-suggestions';
import { SuggestionsSkeleton } from '../skeleton/suggestions-skeleton';

export function SuggestionsList({ suggestions, loading }: SuggestionsListProps) {
  if (loading) {
    return <SuggestionsSkeleton />;
  }

  if (suggestions.length === 0) {
    return <EmptySuggestions />;
  }

  return (
    <AnimatePresence mode="wait">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </AnimatePresence>
  );
}
