// src/features/suggestions/pages/suggestion-page.tsx

import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { MessageSquareHeart } from 'lucide-react';
import { extractSuggestionsConfig } from '../lib/suggestion.utils';
import { SuggestionForm, SuggestionsList } from '../components';
import { useSuggestionsQuery, useSubmitSuggestion } from '../hooks/use-suggestions-query';

export default function SuggestionsPage() {
  const { user } = useAuth();
  const configRaw = useConfig();
  const config = extractSuggestionsConfig(configRaw?.suggestions);

  // Use TanStack Query hooks
  const { data: suggestions = [], isLoading: loading } = useSuggestionsQuery(user?.id);
  const submitMutation = useSubmitSuggestion();

  const handleSubmit = (content: string): Promise<void> => {
    if (!user) return Promise.resolve();
    submitMutation.mutate({ content, userId: user.id });
    return Promise.resolve();
  };

  return (
    <motion.div
      className="container-wide stack-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 section-divider">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageSquareHeart className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="heading-2">
            Buzón de Sugerencias
          </h1>
          <p className="body text-muted-foreground">
            ¿Tienes una idea para mejorar la app? ¡Nos encantaría escucharla!
          </p>
        </div>
      </div>

      {/* Form */}
      <SuggestionForm
        config={config}
        onSubmit={handleSubmit}
        loading={submitMutation.isPending}
      />

      {/* List */}
      <div className="stack-4">
        <h2 className="heading-3">Tus sugerencias</h2>
        <SuggestionsList suggestions={suggestions} loading={loading} />
      </div>
    </motion.div>
  );
}
