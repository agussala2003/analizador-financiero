// src/features/dashboard/components/DashboardSkeleton.tsx

import { Card, CardHeader } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

export const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Card><CardHeader><Skeleton className="h-10 w-full" /></CardHeader></Card>
        <Skeleton className="h-80 w-full rounded-lg" />
    </div>
);