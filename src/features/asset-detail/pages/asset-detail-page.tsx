// src/features/asset-detail/pages/asset-detail-page.tsx

import { Link, useParams } from "react-router-dom";
import { useAssetData } from "../../dashboard/hooks/use-asset-data";

import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { HistoricalPerformanceChart } from "../../dashboard/components/historical-performance-chart";

import { ArrowLeft, BarChart3, DollarSign, Info, Newspaper } from "lucide-react";

// Componentes modularizados
import { AssetDetailSkeleton } from "../components/asset-detail-skeleton";
import { AssetHeader } from "../components/asset-header";
import { AssetKeyMetrics } from "../components/asset-key-metrics";
import { RatingScorecard } from "../components/rating-scorecard";
import { AssetProfileTab } from "../components/asset-profile-tab";
import { AssetFinancialsTab } from "../components/asset-financials-tab";

export default function AssetDetailPage() {
    const { symbol } = useParams<{ symbol: string }>();

    const { data: asset, isLoading, isError, error } = useAssetData(symbol!);

    if (isLoading) {
        return <AssetDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="text-center py-20 px-4">
                <h2 className="text-2xl font-bold text-destructive">Error al cargar el activo</h2>
                <p className="text-muted-foreground mt-2">{error.message}</p>
                <Button asChild className="mt-6" variant="outline">
                    <Link to="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </Link>
                </Button>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="text-center py-20 px-4">
                <h2 className="text-2xl font-bold">Activo no encontrado</h2>
                <p className="text-muted-foreground mt-2">
                    No pudimos encontrar datos para el símbolo <span className="font-mono bg-muted px-1 rounded">"{symbol}"</span>.
                </p>
                <Button asChild className="mt-6" variant="outline">
                    <Link to="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            className="container px-4 py-6 mx-auto sm:px-6 lg:px-8 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Button variant="outline" asChild className="mb-4">
                <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                </Link>
            </Button>

            <AssetHeader asset={asset} />
            <AssetKeyMetrics asset={asset} />
            <RatingScorecard rating={asset.rating} currentPrice={asset.currentPrice} dcf={asset.dcf} />

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    <TabsTrigger value="profile" className="flex items-center gap-2"><Info className="w-4 h-4" /> Perfil</TabsTrigger>
                    <TabsTrigger value="chart" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Gráfico</TabsTrigger>
                    <TabsTrigger value="financials" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Finanzas</TabsTrigger>
                    <TabsTrigger value="news" className="flex items-center gap-2"><Newspaper className="w-4 h-4" /> Noticias</TabsTrigger>
                </TabsList>

                <motion.div
                    key="tabs-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <TabsContent value="profile" className="mt-6">
                        <AssetProfileTab asset={asset} />
                    </TabsContent>

                    <TabsContent value="chart" className="mt-6">
                        <Card className="p-4">
                            <HistoricalPerformanceChart assets={[asset]} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="financials" className="mt-6">
                        <AssetFinancialsTab asset={asset} />
                    </TabsContent>

                    <TabsContent value="news" className="mt-6">
                        <Card className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Newspaper className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">Próximamente: Noticias del activo</p>
                            </div>
                        </Card>
                    </TabsContent>
                </motion.div>
            </Tabs>
        </motion.div>
    );
}