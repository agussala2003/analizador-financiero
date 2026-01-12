// src/features/sectors-industries/components/skeleton.tsx

import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

/**
 * Loading skeleton for the sectors and industries page.
 * 
 * ../../..remarks
 * Displays placeholder content while data is being fetched.
 */
export const SectorsIndustriesSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container-wide stack-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 sm:pb-6 mb-4 sm:mb-6 border-b">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[350px]" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-[300px]" />

        {/* Selector Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px] mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[130px] mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
