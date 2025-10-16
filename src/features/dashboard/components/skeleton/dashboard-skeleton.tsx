// src/features/dashboard/components/skeleton/dashboard-skeleton.tsx

import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";

/**
 * Skeleton loader para el Dashboard
 * Muestra un layout similar al dashboard real para mejor UX
 */
export const DashboardSkeleton = () => (
    <div className="container-wide space-y-4 sm:space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1.5 sm:space-y-2">
                <Skeleton className="h-6 sm:h-8 w-40 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
            </div>
            <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
                        <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                        <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                        <Skeleton className="h-6 sm:h-7 w-24 sm:w-32 mb-1.5 sm:mb-2" />
                        <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Main Chart */}
            <Card className="col-span-2">
                <CardHeader className="p-4 sm:p-6">
                    <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
                    <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-[280px] sm:h-[350px] w-full" />
                </CardContent>
            </Card>
        </div>

        {/* Analysis Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-[200px] sm:h-[250px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-[200px] sm:h-[250px] w-full" />
                </CardContent>
            </Card>
        </div>

        {/* Assets Table */}
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-2.5 sm:space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2.5 sm:gap-4">
                            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                            <div className="flex-1 space-y-1.5 sm:space-y-2">
                                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                                <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
                            </div>
                            <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);
