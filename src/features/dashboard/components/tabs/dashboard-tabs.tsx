// src/features/dashboard/components/DashboardTabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { AssetData } from "../../../../types/dashboard";
import { PriceAnalysisTable } from "../analysis/price-analysis-table";
import { FundamentalsTable } from "../analysis/fundamentals-table";
import { CorrelationMatrix } from "../analysis/correlation-matrix";
import { RadarComparison } from "../analysis/radar-comparison";
import { HistoricalPerformanceChart } from "../charts/historical-performance-chart";
import SummaryAnalysis from "../analysis/summary-analysis";
import { indicatorConfig } from "../../../../utils/financial";
import { BarChart2, LayoutGrid, GitCompareArrows, Zap, AreaChart, BrainCircuit } from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";

interface DashboardTabsProps {
    assets: AssetData[];
    isLoading: boolean;
}

export function DashboardTabs({ assets, isLoading }: DashboardTabsProps) {
    if (isLoading && assets.length === 0) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <Tabs defaultValue="prices" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto mb-4 sm:mb-6">
                <TabsTrigger value="prices" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Precios</span>
                    <span className="sm:hidden">$</span>
                </TabsTrigger>
                <TabsTrigger value="fundamentals" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Indicadores</span>
                    <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger value="correlation" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <GitCompareArrows className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Correlación</span>
                    <span className="sm:hidden">⟷</span>
                </TabsTrigger>
                <TabsTrigger value="radar" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Radar</span>
                    <span className="sm:hidden">⚡</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <AreaChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Gráficos</span>
                    <span className="sm:hidden">📈</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
                    <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Resumen IA</span>
                    <span className="sm:hidden">🧠</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="prices"><PriceAnalysisTable assets={assets} /></TabsContent>
            <TabsContent value="fundamentals"><FundamentalsTable assets={assets} /></TabsContent>
            <TabsContent value="correlation"><CorrelationMatrix assets={assets} /></TabsContent>
            <TabsContent value="radar"><RadarComparison assets={assets} /></TabsContent>
            <TabsContent value="charts"><HistoricalPerformanceChart assets={assets} /></TabsContent>
            <TabsContent value="summary"><SummaryAnalysis assets={assets} indicatorConfig={indicatorConfig} /></TabsContent>
        </Tabs>
    );
}
