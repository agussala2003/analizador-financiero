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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto mb-4">
                <TabsTrigger value="prices"><BarChart2 className="w-4 h-4 mr-2" />Precios</TabsTrigger>
                <TabsTrigger value="fundamentals"><LayoutGrid className="w-4 h-4 mr-2" />Indicadores</TabsTrigger>
                <TabsTrigger value="correlation"><GitCompareArrows className="w-4 h-4 mr-2" />Correlación</TabsTrigger>
                <TabsTrigger value="radar"><Zap className="w-4 h-4 mr-2" />Radar</TabsTrigger>
                <TabsTrigger value="charts"><AreaChart className="w-4 h-4 mr-2" />Gráficos</TabsTrigger>
                <TabsTrigger value="summary"><BrainCircuit className="w-4 h-4 mr-2" />Resumen IA</TabsTrigger>
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
