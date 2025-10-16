// src/features/dashboard/pages/dashboard-page.tsx

import { useEffect, useRef, useMemo } from "react";
import { useDashboard } from "../../../hooks/use-dashboard";
import { usePortfolio } from "../../../hooks/use-portfolio";
import { useQueries } from '@tanstack/react-query';
import { useAuth } from "../../../hooks/use-auth";
import { useConfig } from "../../../hooks/use-config";
import { fetchTickerData } from "../../../services/api/asset-api";
import { toast } from "sonner";

import { Card, CardHeader } from "../../../components/ui/card";
import { Briefcase, ChartCandlestick } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../../components/ui/page-header";
import { TickerAddForm } from "../components/ticker-input/ticker-add-form";
import { SelectedTickersList } from "../components/ticker-input/selected-tickers-list";
import { DashboardTabs } from "../components/tabs/dashboard-tabs";
import { DashboardSkeleton } from "../components/skeleton/dashboard-skeleton";
import { AssetData } from "../../../types/dashboard";
import { ErrorBoundary } from "../../../components/error-boundary";

function DashboardPageContent() {
    const { addTicker, removeTicker, selectedTickers } = useDashboard();
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const { user, profile } = useAuth();
    const config = useConfig();
    const portfolioLoadedRef = useRef(false);

    // Referencia para trackear qué tickers vienen del portafolio (no deben contar API calls)
    const portfolioTickersRef = useRef<Set<string>>(new Set());

    // Cargar tickers del portfolio, actualizar la referencia y agregarlos al dashboard
    useEffect(() => {
        // Ejecutar solo una vez cuando el portfolio cargue y no se haya cargado antes
        if (!portfolioLoading && holdings.length > 0 && !portfolioLoadedRef.current) {
            portfolioLoadedRef.current = true;
            
            const portfolioSymbols = holdings.map(h => h.symbol);
            
            // 1. Actualizar la referencia PRIMERO
            portfolioTickersRef.current = new Set(portfolioSymbols);
            
            // 2. Agregar los tickers al dashboard DESPUÉS
            // Esto causará re-renders, pero la referencia ya estará actualizada
            portfolioSymbols.forEach(symbol => {
                addTicker(symbol);
            });
        }
    }, [portfolioLoading, holdings, addTicker]);

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
                queryFn: () => {
                    // Verificar si es del portfolio AL MOMENTO de ejecutar la query
                    const isFromPortfolio = portfolioTickersRef.current.has(ticker);
                    return fetchTickerData({ 
                        queryKey: ['assetData', ticker, config, user, profile],
                        fromPortfolio: isFromPortfolio // No cuenta API call si viene del portafolio
                    });
                },
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

    if (isInitialLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="container-wide stack-6">
            <PageHeader
                icon={<ChartCandlestick className="w-8 h-8 text-primary" />}
                title="Dashboard de Análisis"
                description="Monitorea y analiza tus activos financieros favoritos en un solo lugar."
            />

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
                    <p className="text-xs sm:text-sm text-muted-foreground">Comienza añadiendo un activo desde la barra de búsqueda superior.</p>
                </motion.div>
            ) : (
                <DashboardTabs assets={assets} isLoading={isLoading} />
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