// src/features/portfolio/components/stats/portfolio-stats.tsx

import { useMemo } from 'react';
import { Card } from "../../../../components/ui/card";
import { Holding, PortfolioContextType } from '../../../../types/portfolio';
import { AssetData } from '../../../../types/dashboard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';
import { formatCurrency, formatPercent } from '../../../../lib/utils';
import { formatNumber, calculatePortfolioMetrics, calculateDailyPlPercent, getColorClass } from '../../lib/portfolio.utils';
import { PerformanceMetrics } from '../../../../utils/performance-metrics';

const StatCard = ({ label, value, colorClass = 'text-foreground', helpText }: { label: string, value: React.ReactNode, colorClass?: string, helpText?: string }) => (
    <Card className="p-3 sm:p-4 hover:border-primary/20 transition-colors">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col h-full justify-between gap-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
                        <p className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight ${colorClass}`}>{value}</p>
                    </div>
                </TooltipTrigger>
                {helpText && <TooltipContent side="top"><p className="text-xs sm:text-sm max-w-[200px]">{helpText}</p></TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    </Card>
);

interface PortfolioStatsProps {
    holdings: Holding[];
    totalPerformance: PortfolioContextType['totalPerformance'];
    portfolioData: Record<string, AssetData>;
    avgHoldingDays?: number;
    historicalMetrics?: PerformanceMetrics;
}

export function PortfolioStats({ holdings, totalPerformance, portfolioData, avgHoldingDays, historicalMetrics }: PortfolioStatsProps) {

    const metrics = useMemo(() => {
        const baseMetrics = calculatePortfolioMetrics(holdings, portfolioData);
        return { ...baseMetrics, avgHoldingDays: avgHoldingDays ?? 0 };
    }, [holdings, portfolioData, avgHoldingDays]);

    const dailyPlPercent = calculateDailyPlPercent(metrics.currentValue, metrics.dailyPL);

    // Clases de color dinámicas
    const currentPlColor = getColorClass(metrics.currentPL);
    const totalPlColor = getColorClass(totalPerformance.pl);
    const dailyPlColor = getColorClass(metrics.dailyPL);

    // Colores para performers (%)
    const bestPctColor = getColorClass(metrics.bestPerformer.plPercent);
    const worstPctColor = getColorClass(metrics.worstPerformer.plPercent);

    // Colores para performers ($)
    const bestUsdColor = getColorClass(metrics.bestPerformerUsd.plValue);
    const worstUsdColor = getColorClass(metrics.worstPerformerUsd.plValue);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* --- Fila 1: Estado Actual --- */}
            <StatCard label="Valor Actual" value={formatCurrency(metrics.currentValue)} helpText="El valor de mercado actual de todas tus posiciones abiertas." />
            <StatCard label="G/P Posiciones Actuales" value={formatCurrency(metrics.currentPL)} colorClass={currentPlColor} helpText="La ganancia o pérdida neta solo de tus posiciones actuales." />
            <StatCard label="Rendimiento Actual (%)" value={formatPercent(metrics.currentPLPercent)} colorClass={currentPlColor} helpText="El rendimiento porcentual basado en el costo de tus posiciones actuales." />
            <StatCard label="G/P del Día" value={`${formatCurrency(metrics.dailyPL)} (${formatPercent(dailyPlPercent)})`} colorClass={dailyPlColor} helpText="El cambio de valor de tu portafolio durante el día de hoy." />

            {/* --- Fila 2: Histórico y Costos --- */}
            <StatCard label="G/P Total (con histórico)" value={formatCurrency(totalPerformance.pl)} colorClass={totalPlColor} helpText="La ganancia o pérdida neta de todo tu historial, incluyendo posiciones cerradas." />
            <StatCard label="Rendimiento Total (%)" value={formatPercent(totalPerformance.percent)} colorClass={totalPlColor} helpText="El rendimiento porcentual total basado en todo el capital que has invertido históricamente." />
            <StatCard label="Promedio Días de Tenencia" value={`${Math.round(metrics.avgHoldingDays)}d`} helpText="Promedio de días que has mantenido cada posición desde su primera compra." />
            <StatCard label="Costo Total (Pos. Actuales)" value={formatCurrency(metrics.totalInvested)} helpText="El costo total de adquisición de tus posiciones actuales." />

            {/* --- Fila 3: Riesgo y Ganancia Nominal (USD) --- */}
            <StatCard label="Beta Ponderado" value={formatNumber(metrics.portfolioBeta)} helpText="Volatilidad de tu portafolio vs. el mercado. <1 es menos volátil, >1 es más volátil." />
            <StatCard
                label="Mejor Activo ($)"
                value={`${metrics.bestPerformerUsd.symbol} (${formatCurrency(metrics.bestPerformerUsd.plValue)})`}
                colorClass={bestUsdColor}
                helpText="El activo que ha generado la mayor ganancia nominal en dólares (posiciones actuales)."
            />
            <StatCard
                label="Peor Activo ($)"
                value={`${metrics.worstPerformerUsd.symbol} (${formatCurrency(metrics.worstPerformerUsd.plValue)})`}
                colorClass={worstUsdColor}
                helpText="El activo que ha generado la mayor pérdida nominal en dólares (posiciones actuales)."
            />
            <StatCard
                label="Máx. Drawdown (Simulado)"
                value={historicalMetrics?.maxDrawdown ? `${(historicalMetrics.maxDrawdown * 100).toFixed(2)}%` : 'N/A'}
                colorClass="text-red-500"
                helpText="La máxima caída desde un pico histórico en el valor del portafolio simulado."
            />

            {/* --- Fila 4: Ganancia Porcentual y Extremos Históricos --- */}
            <StatCard
                label="Mejor Activo (%)"
                value={`${metrics.bestPerformer.symbol} (${formatPercent(metrics.bestPerformer.plPercent)})`}
                colorClass={bestPctColor}
                helpText="El activo con mayor rendimiento porcentual."
            />
            <StatCard
                label="Peor Activo (%)"
                value={`${metrics.worstPerformer.symbol} (${formatPercent(metrics.worstPerformer.plPercent)})`}
                colorClass={worstPctColor}
                helpText="El activo con menor rendimiento porcentual."
            />

            {historicalMetrics && (
                <>
                    <StatCard
                        label="Mejor Año (Simulado)"
                        value={historicalMetrics.bestYear ? `${historicalMetrics.bestYear.year} (${(historicalMetrics.bestYear.return * 100).toFixed(2)}%)` : 'N/A'}
                        colorClass={historicalMetrics.bestYear && historicalMetrics.bestYear.return > 0 ? "text-green-500" : ""}
                        helpText="El mejor año calendario simulado del actual portafolio (Estrategia Buy & Hold)."
                    />
                    <StatCard
                        label="Peor Año (Simulado)"
                        value={historicalMetrics.worstYear ? `${historicalMetrics.worstYear.year} (${(historicalMetrics.worstYear.return * 100).toFixed(2)}%)` : 'N/A'}
                        colorClass={historicalMetrics.worstYear && historicalMetrics.worstYear.return < 0 ? "text-red-500" : ""}
                        helpText="El peor año calendario simulado del actual portafolio (Estrategia Buy & Hold)."
                    />
                </>
            )}
        </div>
    );
}