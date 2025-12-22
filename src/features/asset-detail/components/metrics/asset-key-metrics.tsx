// src/features/asset-detail/components/metrics/asset-key-metrics.tsx

import { useMemo } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { KeyMetricItem } from './key-metric-item';
import { formatLargeNumber, formatPrice } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';
import { calculatePerformanceMetrics } from '../../../../utils/performance-metrics';

/**
 * Props para el componente AssetKeyMetrics.
 * @property asset - Datos del activo
 */
interface AssetKeyMetricsProps {
  asset: AssetData;
}

/**
 * Componente que muestra métricas clave del activo en un grid responsive.
 * Incluye:
 * - Market Cap, Volumen, Vol. Promedio, Beta, Rango 52s, Dividendo
 * - Best Year, Worst Year, Max Drawdown (Calculados on-the-fly)
 * 
 * Grid: 2 cols en móvil, 3 en tablets, 4 o 5 en desktop.
 * 
 * @example
 * ```tsx
 * <AssetKeyMetrics asset={assetData} />
 * ```
 */
export function AssetKeyMetrics({ asset }: AssetKeyMetricsProps) {
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(asset.historicalRaw || []);
  }, [asset.historicalRaw]);

  const formatYearMetric = (m: { year: number; return: number } | null) => {
    if (!m) return 'N/A';
    return `${m.year} (${(m.return * 100).toFixed(2)}%)`;
  };

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4">
        <KeyMetricItem
          label="Market Cap"
          value={`$${formatLargeNumber(asset.marketCap)}`}
        />
        <KeyMetricItem
          label="Volumen"
          value={formatLargeNumber(asset.volume)}
        />
        <KeyMetricItem
          label="Vol. Promedio"
          value={formatLargeNumber(asset.averageVolume)}
        />
        <KeyMetricItem
          label="Beta"
          value={
            typeof asset.beta === 'number' ? asset.beta.toFixed(2) : 'N/A'
          }
        />
        <KeyMetricItem
          label="Rango 52 Semanas"
          value={typeof asset.range === 'string' ? asset.range : 'N/A'}
        />
        <KeyMetricItem
          label="Último Dividendo"
          value={
            typeof asset.lastDividend === 'number' && asset.lastDividend > 0
              ? formatPrice(asset.lastDividend)
              : 'N/A'
          }
        />
        {/* Nuevas métricas calculadas */}
        <KeyMetricItem
          label="Mejor Año"
          value={formatYearMetric(metrics.bestYear)}
          className={metrics.bestYear && metrics.bestYear.return > 0 ? "text-green-500" : ""}
        />
        <KeyMetricItem
          label="Peor Año"
          value={formatYearMetric(metrics.worstYear)}
          className={metrics.worstYear && metrics.worstYear.return < 0 ? "text-red-500" : ""}
        />
        <KeyMetricItem
          label="Máx. Drawdown"
          value={metrics.maxDrawdown !== 0 ? `${(metrics.maxDrawdown * 100).toFixed(2)}%` : 'N/A'}
          className="text-red-500"
        />
      </CardContent>
    </Card>
  );
}
