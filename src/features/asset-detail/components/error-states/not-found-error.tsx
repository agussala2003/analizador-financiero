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
    <div className="text-center py-20 px-4">
      <h2 className="heading-2">Activo no encontrado</h2>
      <p className="body text-muted-foreground mt-2">
        No pudimos encontrar datos para el símbolo{' '}
        <span className="font-mono bg-muted px-1 rounded">"{symbol}"</span>.
      </p>
      <Button asChild className="mt-6" variant="outline">
        <Link to="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
      </Button>
    </div>
  );
}
