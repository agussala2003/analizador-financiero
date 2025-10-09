// src/components/pages/dashboard-page.tsx

import { useEffect, useRef, useMemo } from "react";
import { useDashboard } from "../../hooks/use-dashboard";
import { usePortfolio } from "../../hooks/use-portfolio";
import { Card, CardHeader } from "../ui/card";
import { Briefcase, ChartCandlestick, GitCompareArrows, LayoutGrid, Zap, BrainCircuit, AreaChart, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AssetData } from "../../types/dashboard";

// Componentes modularizados
import { PageHeader } from "../ui/page-header";
import { TickerAddForm } from "../dashboard/ticker-add-form";
import { SelectedTickersList } from "../dashboard/selected-tickers-list";
import { PriceAnalysisTable } from "../dashboard/price-analisys-table";
import { FundamentalsTable } from "../dashboard/fundamentals-table";
import { CorrelationMatrix } from "../dashboard/correlation-matrix";
import { RadarComparison } from "../dashboard/radar-comparison";
import { HistoricalPerformanceChart } from "../dashboard/historical-performance-chart";
import SummaryAnalysis from "../dashboard/summary-analysis";
import { indicatorConfig } from "../../utils/financial";

const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Card><CardHeader><Skeleton className="h-10 w-full" /></CardHeader></Card>
        <Skeleton className="h-80 w-full rounded-lg" />
    </div>
);

export default function DashboardPage() {
    const { addTicker, removeTicker, selectedTickers, assetsData, loading: dashboardLoading } = useDashboard();
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const portfolioLoadedRef = useRef(false);

    // Carga los activos del portafolio al dashboard una sola vez
    useEffect(() => {
        if (portfolioLoadedRef.current || portfolioLoading || !holdings?.length) return;
        portfolioLoadedRef.current = true;
        const portfolioSymbols = holdings.map(h => h.symbol);
        Promise.all(portfolioSymbols.map(symbol => addTicker(symbol, { addToSelected: true })));
    }, [portfolioLoading, holdings, addTicker]);

    const assets: AssetData[] = useMemo(() => {
        return selectedTickers
            .map(ticker => assetsData[ticker])
            .filter((asset): asset is AssetData => !!asset);
    }, [selectedTickers, assetsData]);

    const isInitialLoading = (dashboardLoading || portfolioLoading) && assets.length === 0;

    if (isInitialLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <PageHeader
                icon={<ChartCandlestick className="w-8 h-8 text-primary" />}
                title="Dashboard de Análisis"
                description="Monitorea y analiza tus activos financieros favoritos en un solo lugar."
            />

            <Card className="mb-6">
                <CardHeader>
                    <TickerAddForm onAddTicker={(ticker) => addTicker(ticker, {})} isLoading={dashboardLoading} />
                    <SelectedTickersList tickers={selectedTickers} onRemoveTicker={removeTicker} />
                </CardHeader>
            </Card>

            {assets.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-6 border-2 border-dashed rounded-lg">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Tu dashboard está vacío</h2>
                    <p className="text-muted-foreground">Comienza añadiendo un activo desde la barra de búsqueda superior.</p>
                </motion.div>
            ) : (
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
            )}
        </div>
    );
}