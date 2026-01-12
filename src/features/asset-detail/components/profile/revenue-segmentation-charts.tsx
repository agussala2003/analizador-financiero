// src/features/asset-detail/components/profile/revenue-segmentation-charts.tsx

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { MapPin, PieChart as PieChartIcon, Activity } from 'lucide-react';
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
} from '../../lib/chart-config';
import type { AssetData } from '../../../../types/dashboard';
import { formatLargeNumber } from '../../lib/asset-formatters';

interface RevenueSegmentationChartsProps {
  asset: AssetData;
}

// Helper para transformar datos crudos de FMP a formato de gráfico
const transformSegmentationData = (inputData: unknown, _label: string) => {

  if (!inputData) {
    return [];
  }

  // 1. Obtener el objeto fuente principal
  // Puede ser un array (histórico) o un objeto directo
  let source = inputData;

  // Si es { data: [...] } (formato paginado)
  if (typeof inputData === 'object' && 'data' in inputData && Array.isArray(inputData.data)) {
    source = inputData.data[0];
  }
  // Si es [item1, item2] (formato histórico array simple)
  else if (Array.isArray(inputData)) {
    source = inputData[0];
  }

  if (!source) {
    return [];
  }

  // 2. DETECCIÓN INTELIGENTE DE DATOS (EL FIX)
  // El log mostró: { symbol: 'ADBE', data: { Americas: 123... } }
  // Si existe una propiedad 'data' que es un objeto (mapa de claves), usamos eso.
  let targetMap = source as Record<string, unknown>;

  if ((source as {data?: unknown}).data && typeof (source as {data?: unknown}).data === 'object' && !Array.isArray((source as {data?: unknown}).data)) {
    targetMap = (source as {data: Record<string, unknown>}).data;
  }

  // 3. Extraer pares clave-valor
  const entries = Object.entries(targetMap)
    .filter(([key, val]) => {
      // Ignorar metadatos conocidos
      const ignoreKeys = [
        'symbol', 'date', 'period', 'fillingDate', 'acceptedDate',
        'calendarYear', 'link', 'finalLink', 'reportedCurrency',
        'fiscalYear', 'currency', 'cik'
      ];
      // Validar que sea un número positivo y no sea una llave ignorada
      return !ignoreKeys.includes(key) && typeof val === 'number' && val > 0;
    })
    .map(([name, value]) => ({ name, value: Number(value) }));

  entries.sort((a, b) => b.value - a.value);

  if (entries.length > 8) {
    const top8 = entries.slice(0, 8);
    const others = entries.slice(8).reduce((sum, item) => sum + item.value, 0);
    if (others > 0) {
      top8.push({ name: 'Otros', value: others });
    }
    return top8;
  }

  return entries;
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-background/95 border rounded-lg shadow-lg p-2 text-xs backdrop-blur-sm z-50">
        <p className="font-semibold mb-1">{name}</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Ingresos:</span>
          <span className="font-mono font-medium">{formatLargeNumber(value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueSegmentationCharts({ asset }: RevenueSegmentationChartsProps) {
  const geoData = useMemo(() => transformSegmentationData(asset.geography, "Geography"), [asset.geography]);
  const productData = useMemo(() => transformSegmentationData(asset.production, "Production"), [asset.production]);

  const renderChart = (data: Record<string, unknown>[], title: string, Icon: React.ComponentType<{ className?: string }>) => (
    <Card className="flex flex-col h-full overflow-hidden border shadow-sm">
      <CardHeader className="p-4 pb-2 border-b bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-[320px] relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer stroke-background stroke-2"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  fontSize: '11px',
                  paddingTop: '20px',
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/5">
            <div className="bg-muted p-3 rounded-full mb-3">
              <Activity className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">No hay datos de segmentación</p>
            <p className="text-xs opacity-70 mt-1">La empresa no reporta este desglose</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Si ninguno tiene datos, mostramos un fallback general o los cuadros vacíos
  // Prefiero mostrar los cuadros vacíos para mantener layout consistente
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="min-h-[350px]">
        {renderChart(geoData, "Ingresos por Región", MapPin)}
      </div>
      <div className="min-h-[350px]">
        {renderChart(productData, "Ingresos por Producto", PieChartIcon)}
      </div>
    </div>
  );
}