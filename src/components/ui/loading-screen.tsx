// src/components/ui/loading-screen.tsx
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  /** Mensaje opcional a mostrar debajo del spinner */
  message?: string;
}

/**
 * Pantalla genérica de carga a pantalla completa para evitar pantallas en blanco.
 * Se usa desde Providers y páginas mientras se resuelven efectos iniciales.
 *
 * @param message Texto opcional a mostrar.
 * @returns JSX.Element
 */
export function LoadingScreen({ message = 'Cargando…' }: LoadingScreenProps) {
  return (
    <div className="bg-[#010d16] flex h-screen w-full flex-col items-center justify-center gap-3 sm:gap-4 px-4">
      {/* ✅ Mejora: Spinner accesible y visible con animación */}
      <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" aria-label="Cargando" />
      <p className="text-xs sm:text-sm text-white text-center">{message}</p>
    </div>
  );
}