// src/features/suggestions/components/card/suggestion-card.tsx

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { SuggestionCardProps } from '../../types/suggestion.types';
import {
  formatSuggestionDate,
  getStatusConfig,
} from '../../lib/suggestion.utils';

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const config = getStatusConfig(suggestion.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
          <div className="flex justify-between items-start gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {formatSuggestionDate(suggestion.created_at)}
            </p>
            <Badge variant={config.variant} className="whitespace-nowrap text-xs">
              {config.icon && <span className="mr-1">{config.icon}</span>}
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-grow p-4 sm:p-6">
          <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">
            {suggestion.content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
