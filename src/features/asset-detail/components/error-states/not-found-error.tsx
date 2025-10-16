// src/features/asset-detail/components/error-states/not-found-error.tsx

import { Link } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Props para el componente NotFoundError.
 * @property symbol - Símbolo del activo que no fue encontrado
 */
interface NotFoundErrorProps {
  symbol: string;
}

/**
 * Componente de error mostrado cuando no se encuentra el activo solicitado.
 * Muestra el símbolo buscado y un botón para volver al dashboard.
 * 
 * @example
 * ```tsx
 * <NotFoundError symbol="AAPL" />
 * ```
 */
export function NotFoundError({ symbol }: NotFoundErrorProps) {
  return (
    <div className="text-center py-12 sm:py-20 px-4">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Activo no encontrado</h2>
      <p className="text-sm sm:text-base text-muted-foreground mt-2">
        No pudimos encontrar datos para el símbolo{' '}
        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs sm:text-sm">"{symbol}"</span>.
      </p>
      <Button asChild className="mt-4 sm:mt-6" variant="outline" size="sm">
        <Link to="/dashboard">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Volver al Dashboard
        </Link>
      </Button>
    </div>
  );
}
