// src/features/asset-detail/components/profile/revenue-segmentation-charts.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Info, MapPin, PieChart as PieChartIcon } from 'lucide-react';
import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';
import {
  CHART_COLORS,
  renderPieChartLabel,
  formatRevenueTooltip,
} from '../../lib/chart-config';
import type { AssetData } from '../../../../types/dashboard';
import type { RevenueChartData } from '../../types/asset-detail.types';

/**
 * Props para el componente RevenueSegmentationCharts.
 * @property asset - Datos del activo con información de ingresos
 */
interface RevenueSegmentationChartsProps {
  asset: AssetData;
}

/**
 * Componente que renderiza dos gráficos de pie para segmentación de ingresos.
 * - Ingresos por geografía
 * - Ingresos por producto
 * 
 * Cada gráfico muestra:
 * - Porcentajes en labels internos
 * - Tooltip con valores en billones
 * - Leyenda horizontal abajo
 * - Mensaje de "Sin datos" si no hay información
 * 
 * @example
 * ```tsx
 * <RevenueSegmentationCharts asset={assetData} />
 * ```
 */
export function RevenueSegmentationCharts({
  asset,
}: RevenueSegmentationChartsProps) {
  const hasGeographicData =
    asset.geographicRevenue && asset.geographicRevenue.length > 0;
  const hasProductData =
    asset.productRevenue && asset.productRevenue.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Ingresos por Geografía */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ingresos por Geografía
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {hasGeographicData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={asset.geographicRevenue as RevenueChartData[]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderPieChartLabel as never}
                >
                  {asset.geographicRevenue.map((_entry, index) => (
                    <Cell
                      key={`cell-geo-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatRevenueTooltip} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Info className="w-8 h-8 mr-2" />
              Sin datos geográficos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingresos por Producto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Ingresos por Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {hasProductData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={asset.productRevenue as RevenueChartData[]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderPieChartLabel as never}
                >
                  {asset.productRevenue.map((_entry, index) => (
                    <Cell
                      key={`cell-prod-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatRevenueTooltip} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Info className="w-8 h-8 mr-2" />
              Sin datos de productos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
