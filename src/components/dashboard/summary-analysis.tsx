import React, { useMemo } from "react";
import { AssetData } from "../../types/dashboard";
import { IndicatorConfig } from "../../utils/financial";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Award, BrainCircuit, DollarSign, PieChart, Shield, TrendingUp, CheckCircle
} from "lucide-react";

// --- Props del Componente ---
interface SummaryAnalysisProps {
    assets: AssetData[];
    indicatorConfig: IndicatorConfig;
}

// --- Componente Principal ---
export default function SummaryAnalysis({ assets, indicatorConfig }: SummaryAnalysisProps) {

    const analysis = useMemo(() => {
        if (assets.length < 1) return null;

        const categories: Record<string, { label: string, metrics: string[] }> = {
            valuation: { label: "Valoración", metrics: ['PER', 'priceToBook', 'fcfYield'] },
            profitability: { label: "Rentabilidad", metrics: ['roe', 'roic', 'operatingMargin'] },
            financial_health: { label: "Salud Financiera", metrics: ['debtToEquity', 'currentRatio'] },
        };

        const scores: Record<string, { total: number; categories: Record<string, number> }> = {};
        assets.forEach(a => {
            scores[a.symbol] = { total: 0, categories: {} };
            Object.keys(categories).forEach(cat => scores[a.symbol].categories[cat] = 0);
        });

        Object.entries(categories).forEach(([catKey, category]) => {
            category.metrics.forEach(metric => {
                const config = indicatorConfig[metric];
                if (!config) return;

                const validAssets = assets
                    .map(a => ({ symbol: a.symbol, value: a.data[metric] }))
                    .filter((a): a is { symbol: string; value: number } => typeof a.value === 'number' && isFinite(a.value));
                
                if (validAssets.length < 1) return;

                validAssets.sort((a, b) => config.lowerIsBetter ? a.value - b.value : b.value - a.value);

                validAssets.forEach((asset, index) => {
                    const points = validAssets.length - index;
                    scores[asset.symbol].total += points;
                    scores[asset.symbol].categories[catKey] += points;
                });
            });
        });

        const rankedAssets = assets
            .map(asset => ({ asset, score: scores[asset.symbol].total }))
            .sort((a, b) => b.score - a.score);

        const categoryWinners: Record<string, string> = {};
        Object.keys(categories).forEach(catKey => {
            let winnerSymbol = "N/A";
            let maxScore = -1;
            assets.forEach(asset => {
                if (scores[asset.symbol].categories[catKey] > maxScore) {
                    maxScore = scores[asset.symbol].categories[catKey];
                    winnerSymbol = asset.symbol;
                }
            });
            categoryWinners[catKey] = winnerSymbol;
        });

        return { rankedAssets, categoryWinners, categories };

    }, [assets, indicatorConfig]);

    if (!analysis || assets.length < 2) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Resumen IA</CardTitle>
                        <CardDescription>Análisis y veredicto de inversión.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <p>Necesitas al menos dos activos para generar una comparación.</p>
                </CardContent>
            </Card>
        );
    }
    
    const winner = analysis.rankedAssets[0];

    const getCategoryIcon = (key: string) => {
        const icons: Record<string, React.ReactNode> = {
            valuation: <DollarSign className="w-5 h-5 text-blue-500" />,
            profitability: <TrendingUp className="w-5 h-5 text-green-500" />,
            financial_health: <Shield className="w-5 h-5 text-indigo-500" />,
        };
        return icons[key] || <PieChart className="w-5 h-5" />;
    };

    return (
        <section className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle>Veredicto del Análisis</CardTitle>
                            <CardDescription>Conclusión basada en el análisis cuantitativo de los activos.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <h3 className="font-bold text-lg text-primary mb-2">
                            🏆 Activo Destacado: {winner.asset.symbol}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            <strong>{winner.asset.companyName}</strong> se posiciona como la opción más robusta y equilibrada del grupo, obteniendo la puntuación más alta en el análisis combinado de métricas de valoración, rentabilidad y salud financiera.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            Ganador por Categoría
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(analysis.categoryWinners).map(([catKey, symbol]) => (
                            <div key={catKey} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {getCategoryIcon(catKey)}
                                    <span className="font-semibold">{analysis.categories[catKey].label}</span>
                                </div>
                                <span className="font-bold text-primary">{symbol}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Ranking General
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {analysis.rankedAssets.map((item, index) => (
                            <div key={item.asset.symbol} className="flex items-center justify-between p-3 border-b last:border-none">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold">{item.asset.symbol}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">{item.score}</span>
                                    <span className="text-muted-foreground"> pts</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}