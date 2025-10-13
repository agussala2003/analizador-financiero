// src/features/risk-premium/components/skeleton/risk-premium-skeleton.tsx

import { Card, CardHeader } from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Skeleton } from '../../../../components/ui/skeleton';

export function RiskPremiumSkeleton() {
  return (
    <div className="space-y-8 container px-4 py-10 mx-auto sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-full sm:w-60" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
        </CardHeader>
      </Card>

      {/* Table Skeleton */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
