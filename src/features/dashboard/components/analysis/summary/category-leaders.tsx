import React from "react";
import { Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { AssetData } from "../../../../../types/dashboard";
import { IndicatorConfig } from "../../../../../utils/financial";

interface CategoryLeadersProps {
    categoryWinners: Record<string, { symbol: string; score: number; metrics: string[] }>;
    categories: Record<string, { label: string; icon: React.ReactNode }>;
    assets: AssetData[];
    indicatorConfig: IndicatorConfig;
}

export default function CategoryLeaders({ categoryWinners, categories, assets, indicatorConfig }: CategoryLeadersProps) {
    const formatMetricValue = (value: number, metric: string) => {
        const config = indicatorConfig[metric];
        if (!config) return value.toFixed(2);
        if (config.asPercent) return `${(value * 100).toFixed(1)}%`;
        if (config.isLargeNumber) return value.toLocaleString('es-AR');
        return value.toFixed(2);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Líderes por Categoría
                </CardTitle>
                <CardDescription>
                    Activos que destacan en áreas específicas
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {Object.entries(categoryWinners).map(([catKey, winner]) => {
                    const category = categories[catKey];
                    const winnerAsset = assets.find(a => a.symbol === winner.symbol);
                    
                    return (
                        <div key={catKey} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {category.icon}
                                    <span className="font-semibold text-sm">{category.label}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary">{winner.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{winner.score} pts</div>
                                </div>
                            </div>
                            
                            {/* Métricas principales */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                {winner.metrics.slice(0, 2).map(metric => {
                                    const value = winnerAsset?.data[metric];
                                    const config = indicatorConfig[metric];
                                    if (!config) return null;
                                    
                                    const displayValue = typeof value === 'number' && isFinite(value) 
                                        ? formatMetricValue(value, metric) 
                                        : 'N/A';
                                    
                                    return (
                                        <div key={metric} className="text-center">
                                            <div className="text-xs text-muted-foreground">{config.label}</div>
                                            <div className={`font-semibold text-sm ${displayValue === 'N/A' ? 'text-muted-foreground' : ''}`}>
                                                {displayValue}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
