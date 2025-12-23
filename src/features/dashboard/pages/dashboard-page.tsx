// src/features/dashboard/pages/dashboard-page.tsx
// Force refresh
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useDashboard } from "../../../hooks/use-dashboard";
import { usePortfolio } from "../../../hooks/use-portfolio";
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "../../../hooks/use-auth";
import { useConfig } from "../../../hooks/use-config";
import { fetchTickerData } from "../../../services/api/asset-api";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

import { Card, CardHeader } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Briefcase, ChartCandlestick, RefreshCw, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../../components/ui/page-header";
import { TickerAddForm } from "../components/ticker-input/ticker-add-form";
import { SelectedTickersList } from "../components/ticker-input/selected-tickers-list";
import { DashboardTabs } from "../components/tabs/dashboard-tabs";
import { DashboardSkeleton } from "../components/skeleton/dashboard-skeleton";
import { AssetData } from "../../../types/dashboard";
import { ErrorBoundary } from "../../../components/error-boundary";
import { DataFreshnessIndicator } from "../../../components/ui/data-freshness-indicator";
import { useCacheFreshness } from "../hooks/use-cache-freshness";
import { PortfolioSelector } from "../../portfolio/components/portfolio-selector";

function DashboardPageContent() {
    const { addTicker, removeTicker, selectedTickers } = useDashboard();
    const { holdings, loading: portfolioLoading, currentPortfolio } = usePortfolio();
    const { user, profile } = useAuth();
    const config = useConfig();
    const queryClient = useQueryClient();

    // Referencia para trackear qué tickers han sido cargados automáticamente de este portfolio
    const loadedPortfolioIdRef = useRef<number | null>(null);

    // Cargar tickers del portfolio actual
    useEffect(() => {
        if (!portfolioLoading && currentPortfolio && holdings.length > 0) {
            // Si cambiamos de portfolio o es la primera carga
            if (loadedPortfolioIdRef.current !== currentPortfolio.id) {
                loadedPortfolioIdRef.current = currentPortfolio.id;

                // Limpiar tickers anteriores del dashboard si se desea (opcional, por ahora solo agregamos)
                // Para una experiencia más limpia, podríamos querer limpiar los tickers 
                // que venían del portfolio anterior, pero mantener los manuales es complejo sin trackear origen.
                // Por simplicidad y UX: Agregamos los nuevos. El usuario puede borrar los que no quiera.

                const portfolioSymbols = holdings.map(h => h.symbol);
                portfolioSymbols.forEach(symbol => {
                    addTicker(symbol);
                });
            }
        }
    }, [portfolioLoading, holdings, currentPortfolio, addTicker]);

    // Limpiar localStorage viejo (ejecutar solo una vez)
    useEffect(() => {
        localStorage.removeItem('portfolioTickers');
        localStorage.removeItem('manualTickers');
        localStorage.removeItem('selectedTickers');
    }, []);

    // Estabilizar valores para las query keys (usar solo primitivos)
    const userId = user?.id ?? null;
    const profileId = profile?.id ?? null;
    const useMockData = config?.useMockData ?? false;

    const assetQueries = useQueries({
        queries: selectedTickers.map(ticker => {
            return {
                // Query key solo con valores primitivos para evitar refetches innecesarios
                queryKey: ['assetData', ticker, userId, profileId, useMockData] as const,
                queryFn: () => fetchTickerData({
                    queryKey: ['assetData', ticker, config, user, profile]
                }),
                staleTime: 1000 * 60 * 10, // 10 minutos de caché (aumentado de 5)
                gcTime: 1000 * 60 * 30, // 30 minutos en caché (aumentado de 15)
                retry: 2, // Solo 2 reintentos
                retryDelay: 1000, // 1 segundo entre reintentos
                refetchOnWindowFocus: false, // No revalidar al cambiar de pestaña
                refetchOnReconnect: false, // No revalidar al reconectar
                enabled: !!ticker && !!config, // Solo ejecutar si tenemos datos
            };
        }),
    });

    // Procesamos los resultados de las queries
    const assets = useMemo(() =>
        assetQueries
            .map(query => query.data)
            .filter((asset): asset is AssetData => asset !== undefined),
        [assetQueries]
    );

    // Detectar activos con error y removerlos automáticamente
    const failedTickers = useMemo(() =>
        assetQueries
            .map((query, index) => query.isError ? selectedTickers[index] : null)
            .filter((ticker): ticker is string => ticker !== null),
        [assetQueries, selectedTickers]
    );

    // Remover tickers que fallaron y mostrar toast
    useEffect(() => {
        if (failedTickers.length > 0) {
            failedTickers.forEach(ticker => {
                removeTicker(ticker);
                toast.error(`No se pudo cargar "${ticker}"`, {
                    description: "Verifica que el símbolo sea correcto o intenta nuevamente más tarde.",
                    duration: 5000,
                });
            });
        }
    }, [failedTickers, removeTicker]);

    const isLoading = assetQueries.some(query => query.isLoading);
    const isInitialLoading = isLoading && assets.length === 0;

    // Obtener información de frescura del cache
    const { oldestUpdate, isLoading: isFreshnessLoading } = useCacheFreshness(selectedTickers);

    // Función para refrescar todos los datos
    const handleRefresh = useCallback(() => {
        if (selectedTickers.length === 0) return;

        toast.info('Actualizando datos...', { duration: 1500 });

        // Borrar el cache de Supabase para estos tickers
        // Esto fuerza a fetchTickerData a ir a la API sin importar la edad del cache
        void supabase
            .from('asset_data_cache')
            .delete()
            .in('symbol', selectedTickers)
            .then(({ error }) => {
                if (error) {
                    console.error('Error al limpiar cache:', error);
                }
            });

        // Reset queries borra completamente el cache y hace refetch
        // Esto garantiza que se llame a la API sin importar el estado del cache
        void queryClient.resetQueries({
            queryKey: ['assetData'],
        });

        // También invalidar la query de frescura para actualizar el indicador
        void queryClient.invalidateQueries({
            queryKey: ['cacheFreshness'],
        });
    }, [selectedTickers, queryClient]);

    if (isInitialLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="container-wide stack-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <PageHeader
                    icon={<ChartCandlestick className="w-8 h-8 text-primary" />}
                    title="Dashboard de Análisis"
                    description="Monitorea y analiza tus activos financieros favoritos."
                    className="mb-0 border-b-0 pb-0"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="hidden sm:flex items-center text-sm text-muted-foreground mr-2">
                        <Layers className="w-4 h-4 mr-1.5" />
                        <span>Viendo:</span>
                    </div>
                    <PortfolioSelector />
                </div>
            </div>

            <Card className="card-static">
                <CardHeader>
                    <TickerAddForm onAddTicker={addTicker} />
                    <SelectedTickersList tickers={selectedTickers} onRemoveTicker={removeTicker} />
                </CardHeader>
            </Card>

            {selectedTickers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12 sm:py-20 px-4 sm:px-6 border-2 border-dashed rounded-lg transition-smooth"
                >
                    <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                    <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Tu dashboard está vacío</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Activos de "{currentPortfolio?.name}" se mostrarán automáticamente.<br />O comienza añadiendo un activo desde la barra de búsqueda.</p>
                </motion.div>
            ) : (
                <>
                    {/* Barra de información y acciones */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            {oldestUpdate && !isFreshnessLoading && (
                                <DataFreshnessIndicator
                                    lastUpdated={oldestUpdate}
                                    label="Datos"
                                    size="md"
                                    onRefresh={handleRefresh}
                                    isRefreshing={isLoading}
                                />
                            )}
                        </div>

                        <Button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                            <span className="hidden sm:inline">Actualizar datos</span>
                            <span className="sm:hidden">Actualizar</span>
                            <span className="sr-only">Actualizar datos del mercado</span>
                        </Button>
                    </div>

                    <DashboardTabs assets={assets} isLoading={isLoading} />
                </>
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ErrorBoundary level="feature" featureName="Dashboard">
            <DashboardPageContent />
        </ErrorBoundary>
    );
}