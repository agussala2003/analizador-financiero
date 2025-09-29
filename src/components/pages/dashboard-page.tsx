import { useEffect, useRef, useState, FormEvent, useMemo } from "react";
import { useDashboard } from "../../hooks/use-dashboard";
import { usePortfolio } from "../../hooks/use-portfolio";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader } from "../ui/card";
import { XIcon, PlusIcon, SearchIcon, BarChart2, Briefcase, GitCompareArrows, LayoutGrid, Zap, BrainCircuit, AreaChart, ChartCandlestick } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AssetData } from "../../types/dashboard";

// Importa los nuevos componentes de análisis
import { PriceAnalysisTable } from "../dashboard/price-analisys-table";
import { FundamentalsTable } from "../dashboard/fundamentals-table";
import { CorrelationMatrix } from "../dashboard/correlation-matrix";
import { RadarComparison } from "../dashboard/radar-comparison";
import { HistoricalPerformanceChart } from "../dashboard/historical-performance-chart"; import SummaryAnalysis from "../dashboard/summary-analysis";
import { indicatorConfig } from "../../utils/financial";
;

const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Card><CardHeader><div className="flex flex-wrap items-center gap-2"><Skeleton className="h-8 w-24 rounded-md" /><Skeleton className="h-8 w-24 rounded-md" /></div></CardHeader></Card>
        <Skeleton className="h-64 w-full rounded-lg" />
    </div>
);

export default function DashboardPage() {
    const [tickerInput, setTickerInput] = useState<string>('');
    const { addTicker, removeTicker, selectedTickers, assetsData, loading: dashboardLoading } = useDashboard();
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const portfolioLoadedRef = useRef(false);
    // Lógica para cargar activos del portafolio (sin cambios)
    useEffect(() => {
        if (portfolioLoadedRef.current || portfolioLoading || !holdings?.length) return;
        portfolioLoadedRef.current = true;
        const portfolioSymbols = holdings.map(h => h.symbol);
        Promise.all(portfolioSymbols.map(symbol => addTicker(symbol, true)));
    }, [portfolioLoading, holdings, addTicker]);

    const assets: AssetData[] = useMemo(() => {
        return selectedTickers
            .map(ticker => assetsData[ticker])
            .filter((asset): asset is AssetData => asset !== undefined);
    }, [selectedTickers, assetsData]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!tickerInput) return;
        await addTicker(tickerInput);
        setTickerInput('');
    };

    const isInitialLoading = (dashboardLoading || portfolioLoading) && assets.length === 0;

    if (isInitialLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-4 pb-4 mb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ChartCandlestick className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard de Analisis</h1>
                        <p className="text-muted-foreground">
                            Monitorea y analiza tus activos financieros favoritos en un solo lugar.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* --- Barra de Búsqueda y Tickers Seleccionados --- */}
            <Card className="mb-6">
                <CardHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                        <SearchIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
                        <Input placeholder="Añadir símbolo (ej: AAPL, MELI)..." value={tickerInput} onChange={(e) => setTickerInput(e.target.value)} className="flex-grow" disabled={dashboardLoading} />
                        <Button type="submit" disabled={dashboardLoading || !tickerInput} className="w-full sm:w-auto">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            {dashboardLoading ? 'Cargando...' : 'Añadir'}
                        </Button>
                    </form>
                    {selectedTickers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t">
                            <AnimatePresence>
                                {selectedTickers.map((ticker) => (
                                    <motion.div key={ticker} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
                                        <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-secondary text-secondary-foreground">
                                            <span>{ticker}</span>
                                            <Button variant="ghost" size="icon" className="w-5 h-5 rounded-full" onClick={() => removeTicker(ticker)}><XIcon className="w-3 h-3" /></Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardHeader>
            </Card>

            {/* --- Contenedor de Pestañas y Vistas de Análisis --- */}
            {assets.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-6 border-2 border-dashed rounded-lg">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Tu dashboard está vacío</h2>
                    <p className="text-muted-foreground">Comienza añadiendo un activo desde la barra de búsqueda superior.</p>
                </motion.div>
            ) : (
                <Tabs defaultValue="prices" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto mb-4">
                        <TabsTrigger value="prices"><BarChart2 className="w-4 h-4 mr-2" />Precios y volatilidad</TabsTrigger>
                        <TabsTrigger value="fundamentals"><LayoutGrid className="w-4 h-4 mr-2" />Indicadores</TabsTrigger>
                        <TabsTrigger value="correlation"><GitCompareArrows className="w-4 h-4 mr-2" />Correlación</TabsTrigger>
                        <TabsTrigger value="radar"><Zap className="w-4 h-4 mr-2" />Radar</TabsTrigger>
                        <TabsTrigger value="charts"><AreaChart className="w-4 h-4 mr-2" />Gráficos</TabsTrigger>
                        <TabsTrigger value="summary"><BrainCircuit className="w-4 h-4 mr-2" />Resumen IA</TabsTrigger>
                    </TabsList>

                    {/* Cada componente de análisis recibe los datos como prop */}
                    <TabsContent value="prices"><PriceAnalysisTable assets={assets} /></TabsContent>
                    <TabsContent value="fundamentals">{<FundamentalsTable assets={assets} />}</TabsContent>
                    <TabsContent value="correlation">{<CorrelationMatrix assets={assets} />}</TabsContent>
                    <TabsContent value="radar">{<RadarComparison assets={assets} />}</TabsContent>
                    <TabsContent value="charts">{<HistoricalPerformanceChart assets={assets} />}</TabsContent>
                    <TabsContent value="summary">{<SummaryAnalysis assets={assets} indicatorConfig={indicatorConfig} />}</TabsContent>
                </Tabs>
            )}
        </div>
    );
}