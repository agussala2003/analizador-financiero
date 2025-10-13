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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comparte tu idea
        </CardTitle>
        <CardDescription>
          Describe tu sugerencia o la nueva funcionalidad que te gustaría ver.
          Cuantos más detalles, mejor podremos entenderla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
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
              className={`mb-1 ${
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
            disabled={
              loading ||
              charCount < config.minLength ||
              charCount === 0 ||
              isOver
            }
            className="w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar sugerencia'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
