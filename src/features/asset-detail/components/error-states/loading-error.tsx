// src/features/asset-detail/components/error-states/loading-error.tsx

import { Link } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Props para el componente LoadingError.
 * @property errorMessage - Mensaje de error a mostrar
 */
interface LoadingErrorProps {
  errorMessage: string;
}

/**
 * Componente de error mostrado cuando falla la carga de datos del activo.
 * Incluye el mensaje de error y un botón para volver al dashboard.
 * 
 * @example
 * ```tsx
 * <LoadingError errorMessage="Error al cargar los datos del servidor" />
 * ```
 */
export function LoadingError({ errorMessage }: LoadingErrorProps) {
  return (
    <div className="text-center py-20 px-4">
      <h2 className="text-2xl font-bold text-destructive">
        Error al cargar el activo
      </h2>
      <p className="text-muted-foreground mt-2">{errorMessage}</p>
      <Button asChild className="mt-6" variant="outline">
        <Link to="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
      </Button>
    </div>
  );
}
