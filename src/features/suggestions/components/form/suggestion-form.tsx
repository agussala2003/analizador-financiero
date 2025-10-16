// src/features/suggestions/components/form/suggestion-form.tsx

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { SuggestionFormProps } from '../../types/suggestion.types';
import {
  validateSuggestionContent,
  isOverLimit,
  isUnderMinimum,
  getCharCountMessage,
} from '../../lib/suggestion.utils';
import { toast } from 'sonner';

export function SuggestionForm({ config, onSubmit, loading }: SuggestionFormProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const isOver = isOverLimit(content, config.maxLength);
  const isUnder = isUnderMinimum(content, config.minLength);
  const { message, colorClass } = getCharCountMessage(charCount, config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSuggestionContent(content, config);
    if (!validation.valid) {
      toast.warning(validation.error);
      textareaRef.current?.focus();
      return;
    }

    await onSubmit(content);
    setContent('');
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Comparte tu idea
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Describe tu sugerencia o la nueva funcionalidad que te gustaría ver.
          Cuantos más detalles, mejor podremos entenderla.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="suggestion-input" className="sr-only">
              Tu sugerencia
            </label>
            <Textarea
              id="suggestion-input"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ej: Me encantaría poder exportar mi portafolio a PDF..."
              rows={4}
              className={`mb-1 text-sm ${
                isOver ? 'border-destructive' : isUnder ? 'border-yellow-500' : ''
              }`}
              disabled={loading}
              aria-invalid={isOver || isUnder}
              aria-describedby="suggestion-hint"
            />
            <div id="suggestion-hint" className={`text-xs text-right ${colorClass}`}>
              {message}
            </div>
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={
              loading ||
              charCount < config.minLength ||
              charCount === 0 ||
              isOver
            }
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            {loading ? 'Enviando...' : 'Enviar sugerencia'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
