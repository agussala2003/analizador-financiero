// src/components/ui/table-skeleton.tsx

import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

interface TableSkeletonProps {
  /** Número de filas a mostrar */
  rows?: number;
  /** Número de columnas */
  columns?: number;
  /** Mostrar header de la tabla */
  showHeader?: boolean;
  /** Mostrar card wrapper */
  showCard?: boolean;
}

/**
 * Skeleton genérico para tablas
 * Útil para cualquier tabla de datos mientras carga
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  showCard = true 
}: TableSkeletonProps) {
  const content = (
    <div className="space-y-3">
      {/* Table Header */}
      {showHeader && (
        <div className="flex items-center gap-4 pb-3 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={`header-${i}`} 
              className="h-4 flex-1" 
              style={{ maxWidth: i === 0 ? '30%' : '20%' }}
            />
          ))}
        </div>
      )}

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1"
              style={{ 
                maxWidth: colIndex === 0 ? '30%' : '20%',
                opacity: 1 - (rowIndex * 0.1) // Fade effect
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
