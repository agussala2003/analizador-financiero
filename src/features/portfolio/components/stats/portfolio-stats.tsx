// src/features/portfolio/components/stats/portfolio-stats.tsx

import { useMemo } from 'react';
import { Card } from "../../../../components/ui/card";
import { Holding, PortfolioContextType, PortfolioAssetData } from '../../../../types/portfolio';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';
import { formatCurrency, formatPercent, formatNumber, calculatePortfolioMetrics, calculateDailyPlPercent, getColorClass } from '../../lib/portfolio.utils';

const StatCard = ({ label, value, colorClass = 'text-foreground', helpText }: { label: string, value: React.ReactNode, colorClass?: string, helpText?: string }) => (
    <Card className="p-4">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col h-full">
                        <p className="text-sm text-muted-foreground mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                    </div>
                </TooltipTrigger>
                {helpText && <TooltipContent><p>{helpText}</p></TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    </Card>
);

export function PortfolioStats({ holdings, totalPerformance, portfolioData }: { holdings: Holding[], totalPerformance: PortfolioContextType['totalPerformance'], portfolioData: Record<string, PortfolioAssetData> }) {
    
    const metrics = useMemo(() => calculatePortfolioMetrics(holdings, portfolioData), [holdings, portfolioData]);

    const dailyPlPercent = calculateDailyPlPercent(metrics.currentValue, metrics.dailyPL);
    
    // Clases de color dinámicas
    const currentPlColor = getColorClass(metrics.currentPL);
    const totalPlColor = getColorClass(totalPerformance.pl);
    const dailyPlColor = getColorClass(metrics.dailyPL);
    const bestPerformerColor = getColorClass(metrics.bestPerformer.plPercent);
    const worstPerformerColor = getColorClass(metrics.worstPerformer.plPercent);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* --- Fila 1 --- */}
            <StatCard label="Valor Actual" value={formatCurrency(metrics.currentValue)} helpText="El valor de mercado actual de todas tus posiciones abiertas." />
            <StatCard label="G/P Posiciones Actuales" value={formatCurrency(metrics.currentPL)} colorClass={currentPlColor} helpText="La ganancia o pérdida neta solo de tus posiciones actuales." />
            <StatCard label="Rendimiento Actual (%)" value={formatPercent(metrics.currentPLPercent)} colorClass={currentPlColor} helpText="El rendimiento porcentual basado en el costo de tus posiciones actuales." />
            <StatCard label="G/P del Día" value={`${formatCurrency(metrics.dailyPL)} (${formatPercent(dailyPlPercent)})`} colorClass={dailyPlColor} helpText="El cambio de valor de tu portafolio durante el día de hoy." />
            
            {/* --- Fila 2 --- */}
            <StatCard label="G/P Total (con histórico)" value={formatCurrency(totalPerformance.pl)} colorClass={totalPlColor} helpText="La ganancia o pérdida neta de todo tu historial, incluyendo posiciones cerradas." />
            <StatCard label="Rendimiento Total (%)" value={formatPercent(totalPerformance.percent)} colorClass={totalPlColor} helpText="El rendimiento porcentual total basado en todo el capital que has invertido históricamente." />
            <StatCard label="Posiciones Totales" value={metrics.positionsCount} helpText="El número de activos diferentes que tienes actualmente." />
            <StatCard label="Costo Total (Pos. Actuales)" value={formatCurrency(metrics.totalInvested)} helpText="El costo total de adquisición de tus posiciones actuales." />

            {/* --- Fila 3 --- */}
            <StatCard label="Beta Ponderado" value={formatNumber(metrics.portfolioBeta)} helpText="Volatilidad de tu portafolio vs. el mercado. <1 es menos volátil, >1 es más volátil." />
            <StatCard label="Ratio de Sharpe Ponderado" value={formatNumber(metrics.sharpeRatio)} helpText="Mide el retorno ajustado por riesgo. Un valor más alto es mejor." />
            <StatCard label="Mejor Activo (G/P %)" value={`${metrics.bestPerformer.symbol} (${formatPercent(metrics.bestPerformer.plPercent)})`} colorClass={bestPerformerColor} />
            <StatCard label="Peor Activo (G/P %)" value={`${metrics.worstPerformer.symbol} (${formatPercent(metrics.worstPerformer.plPercent)})`} colorClass={worstPerformerColor} />
        </div>
    );
}