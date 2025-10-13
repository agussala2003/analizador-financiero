// src/components/suspense/suspense-fallback.tsx

import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

/**
 * Tipos de fallback disponibles
 */
type FallbackType = 'spinner' | 'skeleton' | 'page' | 'minimal';

interface SuspenseFallbackProps {
  /**
   * Tipo de fallback a mostrar
   * - spinner: Spinner centrado con mensaje
   * - skeleton: Layout skeleton completo
   * - page: Página completa con skeleton
   * - minimal: Solo un loader pequeño
   */
  type?: FallbackType;
  /**
   * Mensaje opcional para mostrar
   */
  message?: string;
}

/**
 * Componente de fallback para Suspense boundaries
 * 
 * Proporciona diferentes variantes de loading states según el contexto
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<SuspenseFallback type="page" />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */
export function SuspenseFallback({ 
  type = 'spinner', 
  message = 'Cargando...' 
}: SuspenseFallbackProps) {
  switch (type) {
    case 'minimal':
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );

    case 'spinner':
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      );

    case 'skeleton':
      return (
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      );

    case 'page':
      return (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Filters/Actions skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Main content skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Fallback específico para tablas
 */
export function TableSuspenseFallback({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Fallback específico para gráficos
 */
export function ChartSuspenseFallback() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Fallback específico para formularios
 */
export function FormSuspenseFallback() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-32 ml-auto" />
      </CardContent>
    </Card>
  );
}
