// src/features/asset-detail/components/skeleton/asset-detail-skeleton.tsx

import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardHeader } from '../../../../components/ui/card';

/**
 * Componente de loading skeleton para la página de detalle del activo.
 * Muestra placeholders animados que coinciden con el layout real:
 * - Breadcrumb
 * - Header (logo + info)
 * - Métricas clave (grid)
 * - Tarjetas de valoración (2 columnas)
 * - Tabs
 * - Contenido principal
 * 
 * @example
 * ```tsx
 * {isLoading ? <AssetDetailSkeleton /> : <AssetDetailPage asset={data} />}
 * ```
 */
export function AssetDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 container px-4 py-6 sm:py-10 mx-auto sm:px-6 lg:px-8">
      <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 rounded-md" />
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg" />
        <div className="space-y-2 sm:space-y-3 flex-1">
          <Skeleton className="h-7 sm:h-9 w-48 sm:w-56" />
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 sm:h-12 w-full rounded-md" />
            ))}
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-56 sm:h-64 w-full rounded-lg" />
        <Skeleton className="h-56 sm:h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 sm:h-12 w-full max-w-md rounded-lg" />
      <Skeleton className="h-64 sm:h-80 w-full rounded-lg" />
    </div>
  );
}
