// src/features/dashboard/components/tabs/dashboard-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { AssetData } from "../../../../types/dashboard";
import { PriceAnalysisTable } from "../analysis/price-analysis-table";
import { FundamentalsTable } from "../analysis/fundamentals-table";
import { CorrelationMatrix } from "../analysis/correlation-matrix";
import { RadarComparison } from "../analysis/radar-comparison";
import { HistoricalPerformanceChart } from "../charts/historical-performance-chart";
import SummaryAnalysis from "../analysis/summary-analysis";
import { indicatorConfig } from "../../../../utils/financial";
import {
    BarChart2,
    LayoutGrid,
    GitCompareArrows,
    Zap,
    AreaChart,
    BrainCircuit
} from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";

interface DashboardTabsProps {
    assets: AssetData[];
    isLoading: boolean;
}

export function DashboardTabs({ assets, isLoading }: DashboardTabsProps) {
    // Si está cargando y no hay activos previos, mostrar skeleton
    // Esto evita mostrar pestañas vacías mientras se cargan los datos iniciales
    if (isLoading && assets.length === 0) {
        return <Skeleton className="h-96 w-full rounded-xl" />;
    }

    // Definición de las pestañas para mantener el código limpio y mantenible
    const tabs = [
        { value: "prices", label: "Precios", icon: BarChart2, mobile: "Precios" },
        { value: "fundamentals", label: "Fundamentales", icon: LayoutGrid, mobile: "Fund." },
        { value: "correlation", label: "Correlación", icon: GitCompareArrows, mobile: "Corr." },
        { value: "radar", label: "Radar", icon: Zap, mobile: "Radar" },
        { value: "charts", label: "Gráficos", icon: AreaChart, mobile: "Gráf." },
        { value: "summary", label: "Resumen IA", icon: BrainCircuit, mobile: "IA" },
    ];

    return (
        <Tabs defaultValue="prices" className="w-full space-y-4">
            <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto ">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            <tab.icon className="w-4 h-4 mr-2 hidden sm:block" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.mobile}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* Contenedor con min-height para evitar colapso visual al cambiar tabs.
               Esto estabiliza el layout si el contenido tarda unos ms en renderizarse.
            */}
            <div className="min-h-[400px]">
                <TabsContent value="prices" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <PriceAnalysisTable assets={assets} />
                </TabsContent>

                <TabsContent value="fundamentals" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <FundamentalsTable assets={assets} />
                </TabsContent>

                <TabsContent value="correlation" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <CorrelationMatrix assets={assets} />
                </TabsContent>

                <TabsContent value="radar" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <RadarComparison assets={assets} />
                </TabsContent>

                <TabsContent value="charts" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <HistoricalPerformanceChart assets={assets} />
                </TabsContent>

                <TabsContent value="summary" className="mt-0 space-y-4 focus-visible:outline-none animate-in fade-in-50 duration-300">
                    <SummaryAnalysis assets={assets} indicatorConfig={indicatorConfig} />
                </TabsContent>
            </div>
        </Tabs>
    );
}