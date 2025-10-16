// src/features/asset-detail/components/metrics/asset-key-metrics.tsx

import { Card, CardContent } from '../../../../components/ui/card';
import { KeyMetricItem } from './key-metric-item';
import { formatLargeNumber, formatPrice } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';

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
 * - Market Cap
 * - Volumen
 * - Volumen Promedio
 * - Beta
 * - Rango 52 semanas
 * - Último Dividendo
 * 
 * Grid: 2 cols en móvil, 3 en tablets, 6 en desktop.
 * 
 * @example
 * ```tsx
 * <AssetKeyMetrics asset={assetData} />
 * ```
 */
export function AssetKeyMetrics({ asset }: AssetKeyMetricsProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
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
      </CardContent>
    </Card>
  );
}
