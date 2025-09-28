import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AssetData } from "../../types/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, ChartConfig } from "../ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { AreaChartIcon } from "lucide-react"

interface HistoricalPerformanceChartProps {
  assets: AssetData[];
}

type TimeRange = "7d" | "30d" | "90d" | "1y" | "ytd" | "all";

export function HistoricalPerformanceChart({ assets }: HistoricalPerformanceChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("all");
  const [visibleAssets, setVisibleAssets] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(assets.map(a => [a.symbol, true]))
  );

  React.useEffect(() => {
    setVisibleAssets(prev => {
      const next = { ...prev };
      assets.forEach(a => {
        if (next[a.symbol] === undefined) next[a.symbol] = true;
      });
      Object.keys(next).forEach(k => {
        if (!assets.some(a => a.symbol === k)) delete next[k];
      });
      return next;
    });
  }, [assets]);

  const { chartData, chartConfig } = React.useMemo(() => {
    if (assets.length === 0) {
      return { chartData: [], chartConfig: {} as ChartConfig };
    }

    // 1. Crear un mapa de precios por fecha para cada activo.
    const pricesByDateByAsset: Record<string, Map<string, number>> = {};
    const allDates = new Set<string>();

    assets.forEach(asset => {
      if (asset.historicalRaw && asset.historicalRaw.length > 0) {
        pricesByDateByAsset[asset.symbol] = new Map();
        asset.historicalRaw.forEach(item => {
          const dateStr = new Date(item.date).toISOString().split('T')[0];
          pricesByDateByAsset[asset.symbol].set(dateStr, item.close);
          allDates.add(dateStr);
        });
      }
    });

    // 2. Ordenar todas las fechas únicas.
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // 3. Construir el `finalChartData` unificado.
    let finalChartData = sortedDates.map(dateStr => {
      const entry: any = {
        day: new Date(dateStr).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
      assets.forEach(asset => {
        entry[asset.symbol] = pricesByDateByAsset[asset.symbol]?.get(dateStr) ?? null;
      });
      return entry;
    });

    // 4. Filtrar por rango de tiempo.
    const dataLength = finalChartData.length;
    if (timeRange !== 'all' && dataLength > 1) {
      let daysToTake: number;
      switch (timeRange) {
        case '7d': daysToTake = 7; break;
        case '30d': daysToTake = 30; break;
        case '90d': daysToTake = 90; break;
        case '1y': daysToTake = 365; break;
        case 'ytd':
          const currentDate = new Date();
          const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
          // Cuenta los días desde el inicio del año en el array de datos, no en el calendario real.
          const startIndex = finalChartData.findIndex(d => new Date(d.day) >= startOfYear);
          daysToTake = startIndex !== -1 ? dataLength - startIndex : dataLength;
          break;
        default: daysToTake = dataLength;
      }
      finalChartData = finalChartData.slice(Math.max(0, dataLength - daysToTake));
    }

    // 5. Construir la configuración del gráfico.
    const config: ChartConfig = {};
    assets.forEach((asset, index) => {
      config[asset.symbol] = {
        label: asset.symbol,
        color: `var(--chart-${(index % 12) + 1})`,
      };
    });

    return { chartData: finalChartData, chartConfig: config as ChartConfig };
  }, [assets, timeRange]);

  const yDomain = React.useMemo(() => {
    if (!chartData?.length) return [0, 100];
    const symbols = Object.keys(visibleAssets).filter(s => visibleAssets[s]);
    if (symbols.length === 0) return [0, 100];

    let minVal = Infinity;
    let maxVal = -Infinity;

    chartData.forEach(row => {
      symbols.forEach(s => {
        const v = row[s];
        if (v !== null && Number.isFinite(v)) {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      });
    });

    if (minVal === Infinity) return [0, 100];

    const padding = (maxVal - minVal) * 0.1;
    return [Math.floor(Math.max(0, minVal - padding)), Math.ceil(maxVal + padding)];
  }, [chartData, visibleAssets]);

  if (assets.length === 0) {
    return (
      <Card className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Añade activos para ver su rendimiento.</p>
      </Card>
    );
  }

  function toggleAsset(symbol: string) {
    setVisibleAssets(prev => ({ ...prev, [symbol]: !prev[symbol] }));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
                <AreaChartIcon className="w-6 h-6 text-primary" />
                <div>
                    <CardTitle>Rendimiento Histórico</CardTitle>
                    <CardDescription>Evolución del precio de cierre de los activos.</CardDescription>
                </div>
            </div>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[160px] rounded-lg h-10">
              <SelectValue placeholder="Seleccionar rango" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Máximo</SelectItem>
              <SelectItem value="1y">Último Año</SelectItem>
              <SelectItem value="ytd">Año Actual (YTD)</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
       <div className="w-full flex gap-2 overflow-x-auto mt-4">
            {assets.map((asset) => {
            const color = `var(--chart-${(assets.findIndex(a => a.symbol === asset.symbol) % 12) + 1})`;
            return (
              <label key={asset.symbol} className="inline-flex items-center gap-2 px-2 rounded-md border bg-muted/30 whitespace-nowrap h-10">
                <Checkbox
                  checked={visibleAssets[asset.symbol] ?? true}
                  onCheckedChange={() => toggleAsset(asset.symbol)}
                  className="h-4 w-4"
                />
                <span className="flex items-center gap-2">
                  <span style={{ width: 10, height: 10, background: color, display: 'inline-block', borderRadius: 3 }} />
                  <span className="text-sm">{asset.symbol}</span>
                </span>
              </label>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value, index) => {
                return index % 4 === 0 ? value : "";
              }}
            />
            <YAxis
              domain={yDomain as [number, number]}
              tickFormatter={(value) => `$${Math.round(Number(value))}`}
              tickLine={false}
              axisLine={false}
              width={80}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={({ payload, label }) => (
                <Card className="p-2 text-sm">
                  <CardHeader className="p-1 font-bold">{label}</CardHeader>
                  <CardContent className="p-1 space-y-1">
                    {payload?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex gap-1">
                          <span>{item.name}: </span>
                          <span className="font-semibold">
                            {typeof item.value === 'number'
                              ? `$${(item.value as number).toFixed(2)}`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {assets.map((asset) => {
              if (!visibleAssets[asset.symbol]) return null;
              const color = chartConfig[asset.symbol]?.color ?? `var(--chart-1)`;
              return (
                <Area
                  key={asset.symbol}
                  dataKey={asset.symbol}
                  type="natural"
                  fill={`url(#fill${asset.symbol})`}
                  stroke={color}
                  connectNulls={false}
                  dot={false}
                  isAnimationActive={true}
                />
              );
            })}
            <defs>
              {assets.map(asset => {
                const color = chartConfig[asset.symbol]?.color ?? `var(--chart-1)`;
                return (
                  <linearGradient key={`grad-${asset.symbol}`} id={`fill${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.07} />
                  </linearGradient>
                );
              })}
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}