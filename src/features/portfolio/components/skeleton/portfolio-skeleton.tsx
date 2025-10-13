// src/features/portfolio/components/skeleton/portfolio-skeleton.tsx

import { Skeleton } from "../../../../components/ui/skeleton";

/**
 * Componente de carga para el portfolio
 */
export function PortfolioSkeleton() {
  return (
    <div className="space-y-6 container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>

      {/* Table */}
      <Skeleton className="h-96 w-full" />

      {/* Transaction History */}
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
