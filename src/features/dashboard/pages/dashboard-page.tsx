// src/features/dashboard/pages/dashboard-page.tsx

import { useEffect, useRef, useMemo } from "react";
import { useDashboard } from "../../../hooks/use-dashboard";
import { usePortfolio } from "../../../hooks/use-portfolio";
import { useQueries } from '@tanstack/react-query';
import { useAuth } from "../../../hooks/use-auth";
import { useConfig } from "../../../hooks/use-config";
import { fetchTickerData } from "../../../services/api/asset-api";
import type { Config } from "../../../types/config";
import type { Profile } from "../../../types/auth";
import type { User } from "@supabase/supabase-js";

import { Card, CardHeader } from "../../../components/ui/card";
import { Briefcase, ChartCandlestick } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../../../components/ui/page-header";
import { TickerAddForm } from "../components/ticker-add-form";
import { SelectedTickersList } from "../components/selected-tickers-list";
import { DashboardTabs } from "../components/dashboard-tabs";
import { DashboardSkeleton } from "../components/dashboard-skeleton";
import { AssetData } from "../../../types/dashboard";

export default function DashboardPage() {
    const { addTicker, removeTicker, selectedTickers } = useDashboard();
    const { holdings, loading: portfolioLoading } = usePortfolio();
    const { user, profile } = useAuth();
    const config = useConfig();
    const portfolioLoadedRef = useRef(false);

    // Carga los activos del portafolio al dashboard una sola vez
    useEffect(() => {
        if (!portfolioLoading && holdings.length > 0 && !portfolioLoadedRef.current) {
            portfolioLoadedRef.current = true;
            const portfolioSymbols = holdings.map(h => h.symbol);
            portfolioSymbols.forEach(symbol => addTicker(symbol));
        }
    }, [portfolioLoading, holdings, addTicker]);

    const assetQueries = useQueries({
        queries: selectedTickers.map(ticker => ({
            queryKey: ['assetData', ticker, config, user, profile] as [string, string, Config, User | null, Profile | null],
            queryFn: fetchTickerData,
            staleTime: 1000 * 60 * 5, // 5 minutos de caché
        })),
    });


    // Procesamos los resultados de las queries
    const assets = useMemo(() =>
        assetQueries
            .map(query => query.data)
            .filter((asset): asset is AssetData => asset !== undefined),
        [assetQueries]
    );

    const isLoading = assetQueries.some(query => query.isLoading);
    const isInitialLoading = isLoading && assets.length === 0;

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
                    <TickerAddForm onAddTicker={addTicker} />
                    <SelectedTickersList tickers={selectedTickers} onRemoveTicker={removeTicker} />
                </CardHeader>
            </Card>

            {selectedTickers.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-6 border-2 border-dashed rounded-lg">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Tu dashboard está vacío</h2>
                    <p className="text-muted-foreground">Comienza añadiendo un activo desde la barra de búsqueda superior.</p>
                </motion.div>
            ) : (
                <DashboardTabs assets={assets} isLoading={isLoading} />
            )}
        </div>
    );
}