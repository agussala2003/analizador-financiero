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
    <div className="space-y-8 container px-4 py-10 mx-auto sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-32 rounded-md" />
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Skeleton className="w-24 h-24 rounded-lg" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-lg" />
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}
