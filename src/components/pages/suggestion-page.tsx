import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/use-auth';
import { useConfig } from '../../hooks/use-config';
import { logger } from '../../lib/logger';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Lightbulb, Send, MessageCircle, MessageSquareHeart } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface Suggestion {
  id: number;
  created_at: string;
  content: string;
  status: 'nueva' | 'en revisión' | 'completada' | 'rechazada' | 'planeada';
}

const SuggestionCard = ({ suggestion }: { suggestion: Suggestion }) => {
  const statusConfig = {
    nueva: { label: 'Nueva', variant: 'default', icon: null },
    'en revisión': { label: 'En revisión', variant: 'secondary', icon: null },
    completada: { label: 'Completada', variant: 'success', icon: '✅' },
    rechazada: { label: 'Rechazada', variant: 'destructive', icon: '❌' },
    planeada: { label: 'Planeada', variant: 'outline', icon: '📅' },
  } as const;

  const config = statusConfig[suggestion.status];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground">
              {new Date(suggestion.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <Badge variant={config.variant} className="whitespace-nowrap">
              {config.icon && <span className="mr-1">{config.icon}</span>}
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-grow">
          <p className="text-sm leading-relaxed text-foreground/90">{suggestion.content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SuggestionSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function SuggestionsPage() {
  const { user } = useAuth();
  const config = useConfig();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSuggestions(data);
        void logger.info('SUGGESTIONS_FETCHED', 'User suggestions fetched successfully.');
      } catch (error: any) {
        toast.error('No se pudieron cargar tus sugerencias.');
        void logger.error('SUGGESTIONS_FETCH_FAILED', error.message);
      } finally {
        setLoading(false);
      }
    };

    void fetchSuggestions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSuggestion.trim();
    if (trimmed.length < config.suggestions.minLength) {
      toast.warning(`Tu sugerencia debe tener al menos ${config.suggestions.minLength} caracteres.`);
      textareaRef.current?.focus();
      return;
    }

    setFormLoading(true);
    const toastId = toast.loading('Enviando tu idea...');

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({ content: trimmed, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;

      setSuggestions([data, ...suggestions]);
      setNewSuggestion('');
      toast.success('¡Gracias por tu aporte! 🙌', { id: toastId });
      void logger.info('SUGGESTION_SUBMITTED', 'Suggestion submitted successfully.', { suggestionId: data.id });
    } catch (error: any) {
      toast.error('Hubo un problema al enviar tu sugerencia.', { id: toastId, description: 'Por favor, inténtalo de nuevo.' });
      void logger.error('SUGGESTION_SUBMISSION_FAILED', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const charCount = newSuggestion.length;
  const isOverLimit = charCount > config.suggestions.maxLength;
  const isUnderMin = charCount > 0 && charCount < config.suggestions.minLength;

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-4 pb-4 mb-6 border-b">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquareHeart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buzón de Sugerencias</h1>
            <p className="text-muted-foreground">¿Tienes una idea para mejorar la app? ¡Nos encantaría escucharla!.</p>
          </div>
        </div>

      <Card className="mb-10">
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
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="suggestion-input" className="sr-only">
                Tu sugerencia
              </label>
              <Textarea
                id="suggestion-input"
                ref={textareaRef}
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Ej: Me encantaría poder exportar mi portafolio a PDF..."
                rows={4}
                className={`mb-1 ${isOverLimit ? 'border-destructive' : isUnderMin ? 'border-yellow-500' : ''}`}
                disabled={formLoading}
                aria-invalid={isOverLimit || isUnderMin}
                aria-describedby="suggestion-hint"
              />
              <div 
                id="suggestion-hint" 
                className={`text-xs text-right ${
                  isOverLimit 
                    ? 'text-destructive' 
                    : isUnderMin 
                      ? 'text-yellow-500' 
                      : 'text-muted-foreground'
                }`}
              >
                {isOverLimit ? (
                  `Máx. ${config.suggestions.maxLength} caracteres`
                ) : (
                  `${charCount}/${config.suggestions.maxLength}`
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={formLoading || charCount < config.suggestions.minLength || charCount === 0}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {formLoading ? 'Enviando...' : 'Enviar sugerencia'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Tus sugerencias</h2>
        
        {loading ? (
          <SuggestionSkeleton />
        ) : suggestions.length > 0 ? (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <Card className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">¿Tienes una idea brillante?</h3>
            <p className="text-muted-foreground max-w-md mx-auto px-4">
              Aún no has enviado ninguna sugerencia. ¡Tu opinión puede ayudarnos a construir algo increíble!
            </p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}