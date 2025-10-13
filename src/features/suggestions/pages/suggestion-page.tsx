// src/features/suggestions/pages/suggestion-page.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/use-auth';
import { useConfig } from '../../../hooks/use-config';
import { toast } from 'sonner';
import { MessageSquareHeart } from 'lucide-react';
import { errorToString } from '../../../utils/type-guards';
import { Suggestion } from '../types/suggestion.types';
import {
  extractSuggestionsConfig,
  fetchUserSuggestions,
  submitSuggestion,
} from '../lib/suggestion.utils';
import {
  SuggestionForm,
  SuggestionsList,
} from '../components';

export default function SuggestionsPage() {
  const { user } = useAuth();
  const configRaw = useConfig();
  const config = extractSuggestionsConfig(configRaw?.suggestions);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchUserSuggestions(user.id);
        setSuggestions(data);
      } catch (error: unknown) {
        toast.error('No se pudieron cargar tus sugerencias.');
        console.error('Suggestions fetch error:', errorToString(error));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [user]);

  const handleSubmit = async (content: string) => {
    if (!user) return;

    setFormLoading(true);
    const toastId = toast.loading('Enviando tu idea...');

    try {
      const newSuggestion = await submitSuggestion(content, user.id);
      setSuggestions([newSuggestion, ...suggestions]);
      toast.success('¡Gracias por tu aporte! ', { id: toastId });
    } catch (error: unknown) {
      toast.error('Hubo un problema al enviar tu sugerencia.', {
        id: toastId,
        description: 'Por favor, inténtalo de nuevo.',
      });
      console.error('Suggestion submission error:', errorToString(error));
    } finally {
      setFormLoading(false);
    }
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
          loading={formLoading}
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
