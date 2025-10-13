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
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageSquareHeart className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Buzón de Sugerencias
          </h1>
          <p className="text-muted-foreground">
            ¿Tienes una idea para mejorar la app? ¡Nos encantaría escucharla!
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mb-10">
        <SuggestionForm
          config={config}
          onSubmit={handleSubmit}
          loading={submitMutation.isPending}
        />
      </div>

      {/* List */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Tus sugerencias</h2>
        <SuggestionsList suggestions={suggestions} loading={loading} />
      </div>
    </motion.div>
  );
}
