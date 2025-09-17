import { useMemo } from 'react';

// --- Componente de Tarjeta (con tooltips de ayuda) ---
const StatCard = ({ label, value, colorClass = 'text-white', helpText }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg relative group">
    <p className="text-sm text-gray-400">{label}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    {helpText && (
      <div className="absolute bottom-full mb-2 w-auto bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-gray-700">
        {helpText}
      </div>
    )}
  </div>
);

// --- Hook de Lógica para Posiciones Actuales ---
const usePortfolioMetrics = (holdings, portfolioData) => {
  return useMemo(() => {
    const initialStats = {
      totalInvested: 0,
      currentValue: 0,
      totalPL: 0,
      totalPLPercent: 0,
      dailyPL: 0,
      bestPerformer: { symbol: 'N/A', pl: 0, plPercent: 0 },
      worstPerformer: { symbol: 'N/A', pl: 0, plPercent: 0 },
      positionsCount: 0,
      portfolioBeta: 'N/A',
      sharpeRatio: 'N/A',
    };
    
    if (!Array.isArray(holdings) || holdings.length === 0) {
      return initialStats;
    }

    let totalInvested = 0;
    let currentValue = 0;
    let dailyPL = 0;
    let weightedBetaSum = 0;
    let weightedSharpeSum = 0;

    const performers = holdings.map(holding => {
      const assetData = portfolioData[holding.symbol];
      const currentPrice = assetData?.currentPrice || 0;
      const dayChange = assetData?.dayChange || 0;

      const holdingValue = holding.quantity * currentPrice;
      const holdingCost = holding.totalCost;
      const holdingPL = holdingValue - holdingCost;
      const holdingPLPercent = holdingCost > 0 ? (holdingPL / holdingCost) * 100 : 0;
      
      const previousDayPrice = currentPrice / (1 + (dayChange / 100));
      dailyPL += holding.quantity * (currentPrice - previousDayPrice);

      totalInvested += holdingCost;
      currentValue += holdingValue;

      if (typeof assetData?.beta === 'number') {
        weightedBetaSum += assetData.beta * holdingValue;
      }
      if (typeof assetData?.sharpeRatio === 'number') {
        weightedSharpeSum += assetData.sharpeRatio * holdingValue;
      }

      return { symbol: holding.symbol, pl: holdingPL, plPercent: holdingPLPercent };
    });

    const totalPL = currentValue - totalInvested;
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    
    performers.sort((a, b) => b.plPercent - a.plPercent);
    const bestPerformer = performers[0] || initialStats.bestPerformer;
    const worstPerformer = performers[performers.length - 1] || initialStats.worstPerformer;
    
    const portfolioBeta = currentValue > 0 ? weightedBetaSum / currentValue : 'N/A';
    const sharpeRatio = currentValue > 0 ? weightedSharpeSum / currentValue : 'N/A';

    return {
      totalInvested,
      currentValue,
      totalPL,
      totalPLPercent,
      dailyPL,
      bestPerformer,
      worstPerformer,
      positionsCount: holdings.length,
      portfolioBeta,
      sharpeRatio,
    };
  }, [holdings, portfolioData]);
};

// --- Componente Principal ---
export default function PortfolioStats({ holdings, portfolioData, totalPerformance }) {
  // Métricas solo para las posiciones actuales
  const currentStats = usePortfolioMetrics(holdings, portfolioData);

  // --- Funciones de formato ---
  const formatCurrency = (value) => {
    if (typeof value !== 'number' || !isFinite(value)) return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  const formatPercent = (value) => {
    if (typeof value !== 'number' || !isFinite(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
  };
  const formatNumber = (value) => {
     if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
     return value.toFixed(2);
  };

  // --- Clases de color dinámicas ---
  const currentPlColor = currentStats.totalPL >= 0 ? 'text-green-400' : 'text-red-400';
  const dailyPlColor = currentStats.dailyPL >= 0 ? 'text-green-400' : 'text-red-400';
  const totalPlColor = totalPerformance?.pl >= 0 ? 'text-green-400' : 'text-red-400';
  const bestPerformerColor = currentStats.bestPerformer.pl >= 0 ? 'text-green-400' : 'text-red-400';
  const worstPerformerColor = currentStats.worstPerformer.pl >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Resumen del Portafolio</h2>
      
      {/* SECCIÓN: Métricas de Posiciones Actuales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Valor Actual" 
          value={formatCurrency(currentStats.currentValue)} 
          helpText="El valor de mercado actual de todas tus posiciones abiertas." 
        />
        <StatCard 
          label="G/P de Posiciones Actuales" 
          value={formatCurrency(currentStats.totalPL)} 
          colorClass={currentPlColor} 
          helpText="La ganancia o pérdida neta solo de tus posiciones actuales." 
        />
        <StatCard 
          label="Rendimiento Actual (%)" 
          value={formatPercent(currentStats.totalPLPercent)} 
          colorClass={currentPlColor} 
          helpText="El rendimiento porcentual basado en el costo de tus posiciones actuales." 
        />
        <StatCard 
          label="G/P del Día" 
          value={`${formatCurrency(currentStats.dailyPL)} (${formatPercent(currentStats.dailyPL / (currentStats.currentValue - currentStats.dailyPL) * 100)})`} 
          colorClass={dailyPlColor} 
          helpText="El cambio de valor de tu portafolio durante el día de hoy." 
        />
      </div>

      {/* SECCIÓN: Métricas Totales (Actual + Histórico) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <StatCard 
            label="G/P Total (con histórico)" 
            value={formatCurrency(totalPerformance?.pl)} 
            colorClass={totalPlColor}
            helpText="La ganancia o pérdida neta de todo tu historial de transacciones, incluyendo posiciones cerradas."
        />
        <StatCard 
            label="Rendimiento Total (%)" 
            value={formatPercent(totalPerformance?.percent)} 
            colorClass={totalPlColor}
            helpText="El rendimiento porcentual total basado en todo el capital que has invertido históricamente."
        />
        <StatCard 
          label="Posiciones Totales" 
          value={currentStats.positionsCount} 
          helpText="El número de activos diferentes que tienes actualmente." 
        />
        <StatCard
          label="Costo Total (Pos. Actuales)"
          value={formatCurrency(currentStats.totalInvested)}
          helpText="El costo total de tus posiciones actuales."
        />
      </div>

      {/* SECCIÓN: Métricas de Riesgo y Activos Individuales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
         <StatCard 
          label="Beta Ponderado" 
          value={formatNumber(currentStats.portfolioBeta)} 
          helpText="Volatilidad de tu portafolio vs. el mercado. <1 es menos volátil, >1 es más volátil." 
        />
        <StatCard 
          label="Ratio de Sharpe Ponderado" 
          value={formatNumber(currentStats.sharpeRatio)} 
          helpText="Mide el retorno ajustado por riesgo. Un valor más alto es mejor." 
        />
        <StatCard 
          label="Mejor Activo (G/P %)" 
          value={`${currentStats.bestPerformer.symbol} (${formatPercent(currentStats.bestPerformer.plPercent)})`} 
          colorClass={bestPerformerColor}
          helpText="El activo con el mayor rendimiento porcentual de tus posiciones actuales."
        />
        <StatCard 
          label="Peor Activo (G/P %)" 
          value={`${currentStats.worstPerformer.symbol} (${formatPercent(currentStats.worstPerformer.plPercent)})`} 
          colorClass={worstPerformerColor}
          helpText="El activo con el peor rendimiento porcentual de tus posiciones actuales."
        />
      </div>
    </div>
  );
}