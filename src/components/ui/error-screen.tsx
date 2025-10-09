// src/components/ui/error-screen.tsx
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ErrorScreenProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Un componente genérico para mostrar un estado de error a pantalla completa.
 * Incluye un botón opcional para reintentar la acción que falló.
 */
export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold text-destructive">{title}</h1>
      <p className="max-w-md text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="destructive" className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  );
}