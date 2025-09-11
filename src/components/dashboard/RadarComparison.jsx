// src/components/dashboard/RadarComparison.jsx
import { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboard } from "../../hooks/useDashboard";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const radarKeys = ['netDebtToEBITDA', 'roic', 'evToEbitda', 'beta', 'PER', 'fcfYield'];

// Rangos NATURALES (min < max). Si lowerIsBetter, invertimos tras normalizar.
const RADAR_METRIC_RANGES = {
  // más bajo es mejor
  netDebtToEBITDA: { min: 0,   max: 5,    lowerIsBetter: true  }, // 0 excelente, >5 pobre
  evToEbitda:      { min: 4,   max: 100,   lowerIsBetter: true  },
  PER:             { min: 5,   max: 40,   lowerIsBetter: true  },
  beta:            { min: 0.3, max: 3.0,  lowerIsBetter: true  },

  // más alto es mejor
  roic:            { min: 0,   max: 50.0, lowerIsBetter: false }, // 0% a 100%
  fcfYield:        { min: 0,   max: 4, lowerIsBetter: false }, // 0% a 50%
};

function normalizeForRadar(value, key) {
  const cfg = RADAR_METRIC_RANGES[key];
  if (!cfg || typeof value !== 'number' || !Number.isFinite(value)) return null;

  const { min, max, lowerIsBetter } = cfg;
  if (min === max) return 0.5;

  // clamp a [min, max]
  const clamped = Math.min(Math.max(value, min), max);

  // normalizar 0..1
  let normalized = (clamped - min) / (max - min);

  // si “más bajo es mejor”, invertimos
  if (lowerIsBetter) normalized = 1 - normalized;

  return normalized;
}

function formatOriginalValue(key, value) {
  if (value == null || !Number.isFinite(value)) return 'N/A';
  if (key === 'roic' || key === 'fcfYield') return `${(value * 100).toFixed(2)}%`;
  if (key === 'beta') return value.toFixed(2);
  if (key === 'PER' || key === 'evToEbitda' || key === 'netDebtToEBITDA') return value.toFixed(2);
  return String(value);
}

export default function RadarComparison() {
  const { selectedTickers, assetsData, indicatorConfig } = useDashboard();

  const radarData = useMemo(() => {

    if (!selectedTickers?.length) return {};

    const dataByTicker = {};

    selectedTickers.forEach((ticker) => {
      const tickerData = assetsData[ticker]?.data;
      if (!tickerData) return;

      const rows = radarKeys.map((key) => {
        const rawValue = tickerData[key];
        const normalized = normalizeForRadar(rawValue, key);

        return {
          metric: indicatorConfig[key]?.label || key,
          value: normalized,                  // puede ser null -> Recharts lo ignora
          originalValue: formatOriginalValue(key, typeof rawValue === 'number' ? rawValue : null),
          _key: key,
        };
      });

      dataByTicker[ticker] = rows;
    });

    return dataByTicker;
  }, [selectedTickers, assetsData, indicatorConfig]);

  if (!selectedTickers?.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        Selecciona activos para comparar
      </div>
    );
  }

  return (
    <div className="w-full flex flex-wrap justify-center gap-4">
      {selectedTickers.map((ticker, i) => (
        <div key={ticker} className="w-full md:w-1/2 lg:w-1/3 h-[400px] p-2 flex flex-col items-center">
          <h3 className="text-xl font-bold text-white mb-2">{ticker}</h3>
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData[ticker]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#d1d5db", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                }}
                formatter={(_, __, props) => {
                  // const k = props?.payload?._key; // Removed unused variable
                  const v = props?.payload?.originalValue ?? 'N/A';
                  return [`Valor original: ${v}`, null];
                }}
                labelFormatter={(label) => <span className="font-bold text-white">{label}</span>}
              />
              <Radar
                name={ticker}
                dataKey="value"
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.4}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
