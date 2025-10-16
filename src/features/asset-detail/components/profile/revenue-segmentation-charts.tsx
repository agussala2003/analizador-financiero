// src/features/asset-detail/components/profile/revenue-segmentation-charts.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Info, MapPin, PieChart as PieChartIcon } from 'lucide-react';
import { usePlanFeature } from '../../../../hooks/use-plan-feature';
import { FeatureLocked } from '../../../../components/shared/feature-locked';
import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from '../../../../components/charts/lazy-recharts';
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
  const { hasAccess: canViewGeographic } = usePlanFeature('revenueGeographic');
  const { hasAccess: canViewProduct } = usePlanFeature('revenueProduct');

  const hasGeographicData =
    asset.geographicRevenue && asset.geographicRevenue.length > 0;
  const hasProductData =
    asset.productRevenue && asset.productRevenue.length > 0;

  // Si no tiene acceso a ninguno de los dos, mostrar mensaje bloqueado
  if (!canViewGeographic && !canViewProduct) {
    return (
      <FeatureLocked
        featureName="Segmentación de Ingresos"
        requiredPlan="plus"
        description="Analiza cómo se distribuyen los ingresos de la empresa por geografía y líneas de productos."
        variant="card"
      />
    );
  }

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
          {!canViewGeographic ? (
            <div className="h-full flex items-center justify-center">
              <FeatureLocked
                featureName="Segmentación Geográfica"
                requiredPlan="plus"
                description="Visualiza cómo se distribuyen los ingresos por región geográfica."
                variant="inline"
              />
            </div>
          ) : hasGeographicData ? (
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
          {!canViewProduct ? (
            <div className="h-full flex items-center justify-center">
              <FeatureLocked
                featureName="Segmentación por Producto"
                requiredPlan="plus"
                description="Descubre qué líneas de productos generan más ingresos."
                variant="inline"
              />
            </div>
          ) : hasProductData ? (
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
