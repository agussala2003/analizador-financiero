// src/features/suggestions/components/empty/empty-suggestions.tsx

import { Card } from '../../../../components/ui/card';
import { Lightbulb } from 'lucide-react';
import { EmptySuggestionsProps } from '../../types/suggestion.types';

export function EmptySuggestions({ message }: EmptySuggestionsProps) {
  return (
    <Card className="text-center py-8 sm:py-12 px-4">
      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
        <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5 sm:mb-2">
        ¿Tienes una idea brillante?
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
        {message ??
          'Aún no has enviado ninguna sugerencia. ¡Tu opinión puede ayudarnos a construir algo increíble!'}
      </p>
    </Card>
  );
}
