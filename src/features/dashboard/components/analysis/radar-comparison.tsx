import * as React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "../../../../components/charts/lazy-recharts"
import { AssetData } from "../../../../types/dashboard"
import { indicatorConfig } from "../../../../utils/financial"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ChartContainer, ChartTooltip, ChartLegend } from "../../../../components/ui/chart"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Zap } from "lucide-react"

// --- Props del Componente ---
interface RadarComparisonProps {
    assets: AssetData[];
}

// --- CONFIGURACIÓN PARA EL GRÁFICO RADAR ---
const radarKeys: (keyof AssetData['data'])[] = ['netDebtToEBITDA', 'roic', 'evToEbitda', 'beta', 'PER', 'fcfYield'];

const RADAR_METRIC_RANGES: Record<string, { min: number; max: number; lowerIsBetter: boolean }> = {
  netDebtToEBITDA: { min: 0,   max: 5,    lowerIsBetter: true  }, // 0 excelente, >5 pobre
  evToEbitda:      { min: 4,   max: 100,   lowerIsBetter: true  },
  PER:             { min: 5,   max: 40,   lowerIsBetter: true  },
  beta:            { min: 0.3, max: 3.0,  lowerIsBetter: true  },
  roic:            { min: 0,   max: 50.0, lowerIsBetter: false }, // 0% a 100%
  fcfYield:        { min: 0,   max: 4, lowerIsBetter: false }, // 0% a 50%
};

// --- Funciones de Normalización y Formato ---
const normalizeForRadar = (value: number | 'N/A', key: string): number | null => {
  const config = RADAR_METRIC_RANGES[key];
  if (!config || typeof value !== 'number' || !isFinite(value)) return 0; // Devuelve 0 para que no se rompa el gráfico

  const { min, max, lowerIsBetter } = config;
  const clamped = Math.max(Math.min(value, max), min);
  let normalized = (clamped - min) / (max - min);

  if (lowerIsBetter) {
    normalized = 1 - normalized;
  }
  return normalized;
};

// --- Componente Principal ---
export const RadarComparison = React.memo(function RadarComparison({ assets }: RadarComparisonProps) {
    // Estado de visibilidad por activo
    const [visibleAssets, setVisibleAssets] = React.useState<Record<string, boolean>>(() =>
        Object.fromEntries(assets.map(a => [a.symbol, true]))
    );

    // Sincroniza el mapa de visibilidad cuando cambian los assets
    React.useEffect(() => {
        setVisibleAssets(prev => {
            const next = { ...prev } as Record<string, boolean>;
            assets.forEach(a => {
                next[a.symbol] ??= true;
            });
            Object.keys(next).forEach(k => {
                if (!assets.some(a => a.symbol === k)) delete next[k];
            });
            return next;
        });
    }, [assets]);

    function toggleAsset(symbol: string) {
        setVisibleAssets(prev => ({ ...prev, [symbol]: !prev[symbol] }));
    }

    const chartData = React.useMemo(() => {
        // La estructura de datos que Recharts espera para un radar comparativo es un array de objetos
        return radarKeys.map(key => {
            const metricData: { metric: string, [ticker: string]: number | string } = {
                metric: indicatorConfig[key as keyof typeof indicatorConfig]?.label || key,
            };
            assets.forEach(asset => {
                metricData[asset.symbol] = normalizeForRadar(asset.data[key], key) ?? 0;
                metricData[`${asset.symbol}_original`] = asset.data[key]; // Guardamos el valor original para el tooltip
            });
            return metricData;
        });
    }, [assets]);
    
    type ChartConfig = Record<string, { label: string }>;
    const chartConfig: ChartConfig = React.useMemo(() => {
        const config: ChartConfig = {};
        assets.forEach(asset => {
            config[asset.symbol] = { label: asset.symbol };
        });
        return config;
    }, [assets]);

    if (assets.length === 0) {
        return (
            <Card className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                    <p className="font-semibold">Sin activos para comparar</p>
                    <p className="text-sm">Añade al menos un activo para ver el gráfico radar.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Radar Comparativo</CardTitle>
                        <CardDescription>
                            Perfil visual del activo. Un punto más alejado del centro es mejor.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full flex gap-2 overflow-x-auto">
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
                <ChartContainer config={chartConfig} className="mx-auto w-full h-[500px]">
                    <RadarChart data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                        <ChartTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ payload, label }: { payload?: unknown[]; label?: React.ReactNode }) => {
                                interface RadarTooltipItem {
                                    name?: string;
                                    color?: string;
                                    payload?: Record<string, unknown>;
                                }
                                return (
                                    <Card className="p-2 text-sm">
                                        <CardHeader className="p-1 font-bold">{label}</CardHeader>
                                        <CardContent className="p-1 space-y-1">
                                            {Array.isArray(payload) && payload.map((itemRaw, index) => {
                                                const item = itemRaw as RadarTooltipItem;
                                                const name = typeof item.name === 'string' ? item.name : '';
                                                const color = typeof item.color === 'string' ? item.color : undefined;
                                                const original = typeof item.payload?.[`${name}_original`] === 'number'
                                                    ? (item.payload?.[`${name}_original`] as number).toFixed(2)
                                                    : 'N/A';
                                                return (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color ?? undefined }} />
                                                        <span>{name}: </span>
                                                        <span className="font-semibold">{original}</span>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                );
                            }}
                        />
                         <ChartLegend />
                        {assets.map((asset, index) => {
                            if (!visibleAssets[asset.symbol]) return null;
                            const colorVar = `var(--chart-${(index % 12) + 1})`;
                            return (
                                <Radar
                                    key={asset.symbol}
                                    name={asset.symbol}
                                    dataKey={asset.symbol}
                                    stroke={colorVar}
                                    fill={colorVar}
                                    fillOpacity={0.4}
                                />
                            );
                        })}
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
});
