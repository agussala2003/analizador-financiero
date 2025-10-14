import { useMemo } from "react";
import { AssetData } from "../../../../types/dashboard";
import { IndicatorConfig } from "../../../../utils/financial";
import { BrainCircuit, DollarSign, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import WinnerCard from "./summary/winner-card";
import CategoryLeaders from "./summary/category-leaders";
import RankingList from "./summary/ranking-list";

// --- Props del Componente ---
interface SummaryAnalysisProps {
    assets: AssetData[];
    indicatorConfig: IndicatorConfig;
}

// Tipo para perfiles
interface AssetProfile {
    symbol: string;
    companyName: string;
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
}

// --- Componente Principal ---
export default function SummaryAnalysis({ assets, indicatorConfig }: SummaryAnalysisProps) {

    const analysis = useMemo(() => {
        if (assets.length < 1) return null;

        const categories: Record<string, { label: string; metrics: string[]; icon: React.ReactNode }> = {
            valuation: { 
                label: "Valoración", 
                metrics: ['PER', 'priceToBook', 'pfc_ratio'],
                icon: <DollarSign className="w-5 h-5" />
            },
            profitability: { 
                label: "Rentabilidad", 
                metrics: ['roe', 'roic', 'operatingMargin'],
                icon: <TrendingUp className="w-5 h-5" />
            },
            financial_health: { 
                label: "Salud Financiera", 
                metrics: ['debtToEquity', 'currentRatio'],
                icon: <Shield className="w-5 h-5" />
            },
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

        const categoryWinners: Record<string, { symbol: string; score: number; metrics: string[] }> = {};
        Object.keys(categories).forEach(catKey => {
            let winnerSymbol = "N/A";
            let maxScore = -1;
            assets.forEach(asset => {
                if (scores[asset.symbol].categories[catKey] > maxScore) {
                    maxScore = scores[asset.symbol].categories[catKey];
                    winnerSymbol = asset.symbol;
                }
            });
            categoryWinners[catKey] = { 
                symbol: winnerSymbol, 
                score: maxScore,
                metrics: categories[catKey].metrics
            };
        });

        // Crear perfiles
        const assetProfiles: AssetProfile[] = assets.map(asset => {
            const debt = typeof asset.data.debtToEquity === 'number' ? asset.data.debtToEquity : 999;
            const currentRatio = typeof asset.data.currentRatio === 'number' ? asset.data.currentRatio : 0;
            
            let riskLevel: 'low' | 'medium' | 'high' = 'medium';
            if (debt < 0.5 && currentRatio > 2) riskLevel = 'low';
            else if (debt > 1.5 || currentRatio < 1) riskLevel = 'high';

            const totalScore = scores[asset.symbol].total;
            const maxScore = rankedAssets[0].score;
            const scorePercentage = (totalScore / maxScore) * 100;

            let recommendation = "";
            if (scorePercentage >= 90) {
                recommendation = "Opción más completa y equilibrada del grupo.";
            } else if (scorePercentage >= 70) {
                recommendation = "Opción sólida con buen desempeño general.";
            } else if (scorePercentage >= 50) {
                recommendation = "Desempeño medio, evalúa tus prioridades de inversión.";
            } else {
                recommendation = "Presenta puntos débiles comparado con otras opciones.";
            }

            return {
                symbol: asset.symbol,
                companyName: asset.companyName,
                score: totalScore,
                riskLevel,
                recommendation
            };
        });

        return { rankedAssets, categoryWinners, categories, assetProfiles };

    }, [assets, indicatorConfig]);

    if (!analysis || assets.length < 2) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Análisis Comparativo</CardTitle>
                        <CardDescription>Comparación de activos</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <p>Necesitas al menos dos activos para generar una comparación.</p>
                </CardContent>
            </Card>
        );
    }
    
    const winner = analysis.rankedAssets[0];
    const winnerProfile = analysis.assetProfiles.find(p => p.symbol === winner.asset.symbol);

    if (!winnerProfile) return null;

    return (
        <section className="space-y-4">
            <WinnerCard
                symbol={winner.asset.symbol}
                companyName={winner.asset.companyName}
                score={winner.score}
                recommendation={winnerProfile.recommendation}
                riskLevel={winnerProfile.riskLevel}
                totalMetrics={Object.values(analysis.categories).reduce((acc, cat) => acc + cat.metrics.length, 0)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
