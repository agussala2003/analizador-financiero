// src/features/dividends/components/skeleton/dividends-skeleton.tsx

import React from "react";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";

/**
 * Skeleton de carga para la tabla de dividendos
 * Muestra placeholders animados mientras se cargan los datos
 */
export const DividendsSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="p-4 border-b">
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`w-full h-9 rounded-md sm:w-${i % 2 === 0 ? 40 : 48}`}
          />
        ))}
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="p-4 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12 rounded-md" />
        ))}
      </div>
    </CardContent>
  </Card>
);
