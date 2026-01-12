// src/features/dashboard/components/skeleton/dashboard-skeleton.tsx

import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";

export const DashboardSkeleton = () => (
    <div className="container-wide space-y-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
            <div className="space-y-2 w-full sm:w-auto">
                <Skeleton className="h-8 w-48 sm:w-64" />
                <Skeleton className="h-4 w-64 sm:w-80" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-[200px]" />
                <Skeleton className="h-10 w-full sm:w-[140px]" />
            </div>
        </div>

        {/* Input & Selected Tickers Area */}
        <Card>
            <CardHeader className="p-4 sm:p-6 space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-full sm:w-[250px]" />
                </div>
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
            </CardHeader>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-md flex-shrink-0" />
                ))}
            </div>

            {/* Main Content Area (Matches Summary Analysis Layout) */}
            <div className="space-y-4">
                {/* Winner Card Skeleton */}
                <Card className="bg-muted/10">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </CardContent>
                </Card>

                {/* Split View Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-lg" />
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);