// src/features/news/components/skeleton/news-skeleton.tsx

import { Card, CardContent, CardFooter, CardHeader } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";

/**
 * Skeleton de carga para tarjetas de noticias
 * Muestra 6 placeholders en un grid responsivo
 */
export const NewsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="flex flex-col h-full">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </div>
            <Skeleton className="h-5 w-10 sm:h-6 sm:w-12 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4 sm:p-6">
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
        </CardContent>
        <CardFooter className="pt-3 sm:pt-4 mt-auto border-t p-4 sm:p-6">
          <div className="flex justify-between w-full">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
);
