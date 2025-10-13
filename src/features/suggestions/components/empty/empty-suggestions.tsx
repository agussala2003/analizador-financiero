// src/features/suggestions/components/empty/empty-suggestions.tsx

import { Card } from '../../../../components/ui/card';
import { Lightbulb } from 'lucide-react';
import { EmptySuggestionsProps } from '../../types/suggestion.types';

export function EmptySuggestions({ message }: EmptySuggestionsProps) {
  return (
    <Card className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Lightbulb className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        ¿Tienes una idea brillante?
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto px-4">
        {message ??
          'Aún no has enviado ninguna sugerencia. ¡Tu opinión puede ayudarnos a construir algo increíble!'}
      </p>
    </Card>
  );
}
