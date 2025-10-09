// src/components/ui/loading-screen.tsx
import { LoaderCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Un componente genérico para mostrar una pantalla de carga a pantalla completa.
 * Ideal para cargas iniciales de la aplicación o de vistas principales.
 */
export function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}