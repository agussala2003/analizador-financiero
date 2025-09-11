// src/components/dashboard/KeyMetricsBarChart.jsx
import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function KeyMetricsBarChart() {
  const { selectedTickers, assetsData } = useDashboard();

  const data = useMemo(() => {
    return selectedTickers.map(ticker => {
      const asset = assetsData[ticker];
      return {
        name: ticker,
        // Convertimos "N/A" a 0 para que el gráfico no se rompa
        sharpeRatio: typeof asset?.sharpeRatio === 'number' ? asset.sharpeRatio : 0,
        yearChange: typeof asset?.yearChange === 'number' ? asset.yearChange : 0,
      };
    });
  }, [selectedTickers, assetsData]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: "#d1d5db" }} />
          <YAxis tick={{ fill: "#d1d5db" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937', // bg-gray-800
              borderColor: '#374151', // border-gray-600
            }}
          />
          <Legend />
          <Bar dataKey="yearChange" name="Retorno Anual (%)" fill={COLORS[0]} />
          <Bar dataKey="sharpeRatio" name="Ratio de Sharpe" fill={COLORS[1]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}