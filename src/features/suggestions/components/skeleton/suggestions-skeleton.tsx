// src/features/suggestions/components/skeleton/suggestions-skeleton.tsx

import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';

export function SuggestionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 sm:w-20" />
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-4 sm:p-6">
            <Skeleton className="h-3 sm:h-4 w-full" />
            <Skeleton className="h-3 sm:h-4 w-4/5" />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
