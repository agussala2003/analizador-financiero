// src/features/suggestions/hooks/use-suggestions-query.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Suggestion } from '../types/suggestion.types';
import { fetchUserSuggestions, submitSuggestion } from '../lib/suggestion.utils';
import { errorToString } from '../../../utils/type-guards';
import { logger } from '../../../lib/logger';

/**
 * Query key factory for suggestions
 */
export const suggestionsKeys = {
  all: ['suggestions'] as const,
  user: (userId: string) => [...suggestionsKeys.all, 'user', userId] as const,
};

/**
 * Hook to fetch user suggestions with TanStack Query
 */
export function useSuggestionsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: suggestionsKeys.user(userId ?? ''),
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return await fetchUserSuggestions(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - suggestions don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
  });
}

/**
 * Hook to submit a new suggestion
 */
export function useSubmitSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, userId }: { content: string; userId: string }) => {
      return await submitSuggestion(content, userId);
    },
    onMutate: () => {
      // Show loading toast
      const toastId = toast.loading('Enviando tu idea...');
      return { toastId };
    },
    onSuccess: (newSuggestion: Suggestion, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData<Suggestion[]>(
        suggestionsKeys.user(variables.userId),
        (oldData) => {
          if (!oldData) return [newSuggestion];
          return [newSuggestion, ...oldData];
        }
      );

      // Show success toast
      if (context?.toastId) {
        toast.success('¡Gracias por tu aporte!', { id: context.toastId });
      }

      // Log success
      void logger.info('SUGGESTION_SUBMITTED', 'User submitted a new suggestion', {
        suggestionId: newSuggestion.id,
        userId: variables.userId,
      });
    },
    onError: (error: unknown, _variables, context) => {
      const errorMessage = errorToString(error);

      // Show error toast
      if (context?.toastId) {
        toast.error('Hubo un problema al enviar tu sugerencia.', {
          id: context.toastId,
          description: 'Por favor, inténtalo de nuevo.',
        });
      }

      // Log error
      void logger.error('SUGGESTION_SUBMIT_FAILED', errorMessage, {
        error: errorMessage,
      });
    },
  });
}
