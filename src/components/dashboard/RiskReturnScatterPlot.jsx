// src/components/dashboard/RiskReturnScatterPlot.jsx
import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Scatter } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

// Mismos colores que usas en otros gráficos para consistencia
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600 shadow-lg">
        <p className="font-bold text-lg">{data.name}</p>
        <p className="text-sm text-blue-300">{`Retorno Anual: ${data.return.toFixed(2)}%`}</p>
        <p className="text-sm text-red-300">{`Riesgo (Volatilidad): ${data.risk.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

export default function RiskReturnScatterPlot() {
  const { selectedTickers, assetsData } = useDashboard();

  const data = useMemo(() => {
    return selectedTickers
      .map(ticker => {
        const asset = assetsData[ticker];
        // Aseguramos que los datos sean números antes de incluirlos
        if (asset && typeof asset.yearChange === 'number' && typeof asset.stdDev === 'number') {
          return {
            name: ticker,
            return: asset.yearChange, // Eje Y
            risk: asset.stdDev,       // Eje X
          };
        }
        return null;
      })
      .filter(Boolean); // Filtramos los nulos si algún activo no tiene los datos
  }, [selectedTickers, assetsData]);

  if (data.length === 0) {
    return <p className="text-center text-gray-400">No hay suficientes datos para mostrar el gráfico de riesgo/retorno.</p>;
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="risk" 
            name="Riesgo (Volatilidad)" 
            unit="%" 
            tick={{ fill: "#d1d5db" }}
            label={{ value: 'Riesgo (Desv. Est. %)', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
          />
          <YAxis 
            type="number" 
            dataKey="return" 
            name="Retorno Anual" 
            unit="%" 
            tick={{ fill: "#d1d5db" }}
            label={{ value: 'Retorno Anual (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {data.map((entry, index) => (
            <Scatter 
              key={entry.name}
              name={entry.name} 
              data={[entry]} // Recharts necesita un array por cada Scatter individual
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}