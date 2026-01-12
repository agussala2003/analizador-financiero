// src/features/dashboard/components/analysis/summary-analysis.tsx

import { useMemo } from "react";
import { AssetData } from "../../../../types/dashboard";
import { IndicatorConfig, indicatorConfig as globalIndicatorConfig } from "../../../../utils/financial";
import { BrainCircuit, DollarSign, Shield, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import WinnerCard from "./summary/winner-card";
import CategoryLeaders from "./summary/category-leaders";
import RankingList from "./summary/ranking-list";

interface SummaryAnalysisProps {
    assets: AssetData[];
    indicatorConfig: IndicatorConfig;
}

interface AssetProfile {
    symbol: string;
    companyName: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
    strengths: string[];
    weaknesses: string[];
}

// Función Helper para resolver valores
const resolveValue = (asset: AssetData, key: string): number | null => {
    if (key === 'upsidePotential') {
        const p = asset.quote?.price;
        const t = asset.priceTargetConsensus?.targetConsensus;
        return (p && t && p > 0) ? (t - p) / p : null;
    }

    const config = globalIndicatorConfig[key];
    if (!config) return null;

    let value: number | null = null;
    const sources = [asset.keyMetrics, asset.profile, asset.quote];

    for (const field of config.apiFields) {
        for (const source of sources) {
            if (source && typeof source === 'object' && field in source) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const val = (source as any)[field];
                if (typeof val === 'number' && Number.isFinite(val)) {
                    value = val;
                    break;
                }
            }
        }
        if (value !== null) break;
    }

    if (value === null && config.compute) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawContext: any = {
            ...(asset.profile as any), // eslint-disable-line @typescript-eslint/no-explicit-any
            ...(asset.quote as any), // eslint-disable-line @typescript-eslint/no-explicit-any
            ...(asset.keyMetrics as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        const computed = config.compute(rawContext);
        if (computed !== null && Number.isFinite(computed)) value = computed;
    }

    return value;
};

export default function SummaryAnalysis({ assets, indicatorConfig }: SummaryAnalysisProps) {

    const analysis = useMemo(() => {
        if (assets.length < 2) return null;

        const categories = {
            valuation: {
                label: "Valoración",
                metrics: ['PER', 'evToEbitda', 'priceToBook', 'pfc_ratio'],
                weight: 0.3,
                icon: <DollarSign className="w-5 h-5" />
            },
            profitability: {
                label: "Calidad y Rentabilidad",
                metrics: ['roe', 'roic', 'operatingMargin', 'grossMargin'],
                weight: 0.3,
                icon: <TrendingUp className="w-5 h-5" />
            },
            financial_health: {
                label: "Salud Financiera",
                metrics: ['netDebtToEBITDA', 'currentRatio'],
                weight: 0.2,
                icon: <Shield className="w-5 h-5" />
            },
            momentum: {
                label: "Potencial y Momento",
                metrics: ['upsidePotential', 'relativeVolume'],
                weight: 0.2,
                icon: <Zap className="w-5 h-5" />
            }
        };

        const scores: Record<string, Record<string, number>> = {};

        assets.forEach(a => {
            scores[a.profile.symbol] = {};
        });

        // Calcular puntajes por categoría
        Object.entries(categories).forEach(([catKey, category]) => {
            category.metrics.forEach(metric => {
                const validAssets = assets.map(a => ({
                    symbol: a.profile.symbol,
                    value: resolveValue(a, metric)
                })).filter(item => item.value !== null) as { symbol: string, value: number }[];

                if (validAssets.length < 2) return;

                let lowerIsBetter = false;
                if (metric === 'upsidePotential') lowerIsBetter = false;
                else lowerIsBetter = indicatorConfig[metric]?.lowerIsBetter ?? false;

                validAssets.sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value);

                validAssets.forEach((item, index) => {
                    // Puntos del 0 al 10 basados en ranking relativo
                    const points = ((validAssets.length - 1 - index) / Math.max(1, validAssets.length - 1)) * 10;
                    if (!scores[item.symbol][catKey]) scores[item.symbol][catKey] = 0;
                    scores[item.symbol][catKey] += points;
                });
            });

            // Normalizar a escala 0-100 por categoría
            assets.forEach(a => {
                const rawScore = scores[a.profile.symbol][catKey] || 0;
                // rawScore es la suma de puntos (0-10). Si hay 4 métricas, máximo es 40.
                // Dividimos por num métricas para promedio (0-10) y multiplicamos por 10 -> (0-100)
                scores[a.profile.symbol][catKey] = (rawScore / Math.max(1, category.metrics.length)) * 10;
            });
        });

        const rankedAssets = assets.map(asset => {
            const s = scores[asset.profile.symbol];

            // Ponderación final (Suma de (0-100 * peso))
            // Como los pesos suman 1.0, el resultado sigue siendo 0-100
            let totalWeighted =
                (s.valuation || 0) * categories.valuation.weight +
                (s.profitability || 0) * categories.profitability.weight +
                (s.financial_health || 0) * categories.financial_health.weight +
                (s.momentum || 0) * categories.momentum.weight;

            // CORRECCIÓN: Eliminada la multiplicación extra por 10
            totalWeighted = Math.round(totalWeighted);

            return { asset, score: totalWeighted, details: s };
        }).sort((a, b) => b.score - a.score);

        const categoryWinners: Record<string, { symbol: string; score: number; metrics: string[] }> = {};
        Object.keys(categories).forEach(catKey => {
            let winner = rankedAssets[0];
            let maxVal = -1;
            rankedAssets.forEach(item => {
                const catScore = item.details[catKey] || 0;
                if (catScore > maxVal) {
                    maxVal = catScore;
                    winner = item;
                }
            });
            categoryWinners[catKey] = {
                symbol: winner.asset.profile.symbol,
                score: Math.round(maxVal), // CORRECCIÓN: Eliminada multiplicación extra
                metrics: categories[catKey as keyof typeof categories].metrics
            };
        });

        const assetProfiles: AssetProfile[] = rankedAssets.map(item => {
            const { asset, score, details } = item;

            const debt = resolveValue(asset, 'debtToEquity') ?? 999;
            const beta = resolveValue(asset, 'beta') ?? 1;

            let riskLevel: 'low' | 'medium' | 'high' = 'medium';
            if (debt < 0.8 && beta < 1.1) riskLevel = 'low';
            else if (debt > 2.0 || beta > 1.5) riskLevel = 'high';

            const strengths: string[] = [];
            const weaknesses: string[] = [];

            if ((details.valuation || 0) > 70) strengths.push("Valoración Atractiva");
            if ((details.profitability || 0) > 70) strengths.push("Alta Calidad");
            if ((details.financial_health || 0) > 70) strengths.push("Balance Sólido");
            if ((details.momentum || 0) > 70) strengths.push("Alto Potencial");

            if ((details.valuation || 0) < 30) weaknesses.push("Valoración Exigente");
            if ((details.financial_health || 0) < 30) weaknesses.push("Riesgo Financiero");

            let recommendation = "";
            if (score >= 80) recommendation = "Excelente opción integral. Destaca por su equilibrio.";
            else if (score >= 60) recommendation = "Opción sólida. Buen desempeño general.";
            else if (score >= 40) recommendation = "Desempeño medio. Evaluar estrategia.";
            else recommendation = "Puntaje bajo comparativo. Revisar fundamentales.";

            return {
                symbol: asset.profile.symbol,
                companyName: asset.profile.companyName,
                score,
                riskLevel,
                recommendation,
                strengths,
                weaknesses
            };
        });

        return { rankedAssets, categoryWinners, categories, assetProfiles };

    }, [assets, indicatorConfig]);

    if (!analysis || assets.length < 2) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 p-4 sm:p-6">
                    <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <div>
                        <CardTitle className="text-lg sm:text-xl">Análisis Comparativo</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Comparación inteligente de activos</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8 sm:py-10 px-4 text-sm sm:text-base">
                    <p>Selecciona al menos dos activos para generar un análisis comparativo y ranking.</p>
                </CardContent>
            </Card>
        );
    }

    const winner = analysis.rankedAssets[0];
    const winnerProfile = analysis.assetProfiles.find(p => p.symbol === winner.asset.profile.symbol);

    if (!winnerProfile) return null;

    return (
        <section className="space-y-3 sm:space-y-4">
            <WinnerCard
                symbol={winner.asset.profile.symbol}
                companyName={winner.asset.profile.companyName}
                score={winner.score}
                recommendation={winnerProfile.recommendation}
                riskLevel={winnerProfile.riskLevel}
                strengths={winnerProfile.strengths}
                totalMetrics={Object.values(analysis.categories).reduce((acc, cat) => acc + cat.metrics.length, 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <CategoryLeaders
                    categoryWinners={analysis.categoryWinners}
                    categories={analysis.categories}
                    assets={assets}
                    indicatorConfig={indicatorConfig}
                />
                <RankingList rankedAssets={analysis.rankedAssets} />
            </div>
        </section>
    );
}