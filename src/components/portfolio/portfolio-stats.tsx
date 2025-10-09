import { useMemo } from 'react';
import { Card } from "../ui/card";
import { Holding, PortfolioContextType, PortfolioAssetData } from '../../types/portfolio';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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

const formatCurrency = (value: number) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPercent = (value: number) => `${Number(value || 0).toFixed(2)}%`;
const formatNumber = (value: number | string) => (typeof value === 'number' && isFinite(value)) ? value.toFixed(2) : 'N/A';

export function PortfolioStats({ holdings, totalPerformance, portfolioData }: { holdings: Holding[], totalPerformance: PortfolioContextType['totalPerformance'], portfolioData: Record<string, PortfolioAssetData> }) {
    
    const metrics = useMemo(() => {
        const initialStats = {
            totalInvested: 0, currentValue: 0, currentPL: 0, currentPLPercent: 0, dailyPL: 0,
            bestPerformer: { symbol: 'N/A', plPercent: 0 }, worstPerformer: { symbol: 'N/A', plPercent: 0 },
            positionsCount: 0, portfolioBeta: 'N/A' as number | 'N/A', sharpeRatio: 'N/A' as number | 'N/A',
        };

        if (!holdings || holdings.length === 0) return initialStats;

        let totalInvested = 0, currentValue = 0, dailyPL = 0, weightedBetaSum = 0, weightedSharpeSum = 0;

        const performers = holdings.map(holding => {
            const assetData: PortfolioAssetData | undefined = portfolioData[holding.symbol];
            const currentPrice = assetData?.currentPrice ?? 0;
            const dayChange = assetData?.dayChange ?? 0;

            const marketValue = holding.quantity * currentPrice;
            const pl = marketValue - holding.totalCost;
            const plPercent = holding.totalCost > 0 ? (pl / holding.totalCost) * 100 : 0;

            if (isFinite(currentPrice) && isFinite(dayChange)) {
                const previousDayPrice = currentPrice / (1 + (dayChange / 100));
                dailyPL += holding.quantity * (currentPrice - previousDayPrice);
            }

            totalInvested += holding.totalCost;
            currentValue += marketValue;

            if (typeof assetData?.beta === 'number') weightedBetaSum += assetData.beta * marketValue;
            if (typeof assetData?.sharpeRatio === 'number') weightedSharpeSum += assetData.sharpeRatio * marketValue;

            return { symbol: holding.symbol, plPercent };
        });

        const currentPL = currentValue - totalInvested;
        const currentPLPercent = totalInvested > 0 ? (currentPL / totalInvested) * 100 : 0;
        
        performers.sort((a, b) => b.plPercent - a.plPercent);

        return {
            totalInvested, currentValue, currentPL, currentPLPercent, dailyPL,
            bestPerformer: performers[0] || initialStats.bestPerformer,
            worstPerformer: performers[performers.length - 1] || initialStats.worstPerformer,
            positionsCount: holdings.length,
            portfolioBeta: currentValue > 0 ? weightedBetaSum / currentValue : 'N/A',
            sharpeRatio: currentValue > 0 ? weightedSharpeSum / currentValue : 'N/A',
        };
    }, [holdings, portfolioData]);

    const dailyPlPercent = metrics.currentValue > 0 ? (metrics.dailyPL / (metrics.currentValue - metrics.dailyPL)) * 100 : 0;
    
    // Clases de color dinámicas
    const currentPlColor = metrics.currentPL >= 0 ? 'text-green-500' : 'text-red-500';
    const totalPlColor = totalPerformance.pl >= 0 ? 'text-green-500' : 'text-red-500';
    const dailyPlColor = metrics.dailyPL >= 0 ? 'text-green-500' : 'text-red-500';
    const bestPerformerColor = metrics.bestPerformer.plPercent >= 0 ? 'text-green-500' : 'text-red-500';
    const worstPerformerColor = metrics.worstPerformer.plPercent >= 0 ? 'text-green-500' : 'text-red-500';

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