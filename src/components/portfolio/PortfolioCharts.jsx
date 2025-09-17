import { useMemo } from "react";
import PropTypes from 'prop-types';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

// --- Constantes y Helpers ---
const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee", "#f472b6", "#f59e0b", "#4ade80", "#93c5fd"];
const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

// --- Tooltip Personalizado para PieChart ---
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = (data.payload.percent * 100).toFixed(2);
    return (
      <div className="p-2 bg-gray-900/80 border border-gray-700 rounded-md shadow-lg text-white text-sm">
        <p className="font-bold">{`${data.name}: ${percentage}%`}</p>
        <p>{`Valor: ${formatCurrency(data.value)}`}</p>
      </div>
    );
  }
  return null;
};

// --- Tooltip Personalizado para BarChart (AHORA MUESTRA %) ---
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="p-2 bg-gray-900/80 border border-gray-700 rounded-md shadow-lg text-white text-sm">
        <p className="font-bold">{label}</p>
        <p className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
          {`G/P: ${formatPercent(value)}`}
        </p>
      </div>
    );
  }
  return null;
};

// --- Hook para procesar datos del portafolio ---
const usePortfolioData = (holdings) => {
  return useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return { allocationData: [], plBySymbol: [], isEmpty: true };
    }

    const totalMarketValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.assetData?.currentPrice || 0)), 0);

    const data = holdings.map(h => {
      const price = h.assetData?.currentPrice || 0;
      const marketValue = h.quantity * price;
      const profitLoss = marketValue - h.totalCost;
      const profitLossPercent = h.totalCost > 0 ? (profitLoss / h.totalCost) * 100 : 0;
      const percent = totalMarketValue > 0 ? (marketValue / totalMarketValue) : 0;
      return { symbol: h.symbol, marketValue, profitLoss, profitLossPercent, percent };
    });

    const allocationData = data.map(d => ({ name: d.symbol, value: d.marketValue, percent: d.percent }));
    const plBySymbol = data.map(d => ({ symbol: d.symbol, pl: d.profitLossPercent })); // Usamos el %

    return { allocationData, plBySymbol, isEmpty: false };
  }, [holdings]);
};


// --- Componente de Etiqueta para PieChart ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// --- Componente Principal ---
export default function PortfolioCharts({ holdings }) {
  const { allocationData, plBySymbol, isEmpty } = usePortfolioData(holdings);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-gray-400">
        No hay datos suficientes para mostrar los gráficos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Distribución por Activo</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={allocationData}
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {allocationData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip content={<CustomPieTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#a0aec0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Ganancia/Pérdida por Activo (%)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plBySymbol} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="symbol" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <ReTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }} />
              <Bar dataKey="pl">
                {plBySymbol.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "#34d399" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

PortfolioCharts.propTypes = {
  holdings: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    totalCost: PropTypes.number.isRequired,
    assetData: PropTypes.shape({
      currentPrice: PropTypes.number,
    }),
  })).isRequired,
};