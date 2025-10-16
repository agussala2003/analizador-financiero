// src/features/portfolio/components/charts/portfolio-charts.tsx

import React, { useMemo } from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Bar,
  BarChart,
  YAxis,
  CartesianGrid,
  LabelList,
} from "../../../../components/charts/lazy-recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "../../../../components/ui/chart";
import { Holding } from "../../../../types/portfolio";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { 
  formatCurrency, 
  formatPercent, 
  calculateAllocationData, 
  calculatePlData, 
  generateChartConfig 
} from "../../lib/portfolio.utils";

// --- Hook para procesar y configurar los datos de los gráficos ---
const useChartData = (holdings: Holding[]) => {
  return useMemo(() => {
    const { allocationData, totalValue } = calculateAllocationData(holdings);
    const plData = calculatePlData(holdings);
    const chartConfig = generateChartConfig(allocationData);

    return { allocationData, plData, chartConfig, totalValue };
  }, [holdings]);
};

// --- Componente de Leyenda Genérico ---
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div
      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
  </div>
);

// --- Componente principal de Gráficos ---
export const PortfolioCharts = React.memo(function PortfolioCharts({ holdings }: { holdings: Holding[] }) {
  const { allocationData, plData, chartConfig } = useChartData(holdings);

  if (holdings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Gráfico Circular: Distribución de Activos */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Distribución de Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0 p-4 sm:p-6">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const name = payload[0].name as string;
                    const entry = allocationData.find((d) => d.name === name);
                    if (!entry) return null;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.name}
                            </span>
                            <span className="font-bold text-foreground">
                              {formatCurrency(entry.value)}
                            </span>
                            <span className="text-[0.70rem] text-muted-foreground">
                              {entry.percentage.toFixed(1)}% del portafolio
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Pie data={allocationData} dataKey="value" nameKey="name">
                  {allocationData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color ?? `var(--chart-${(allocationData.indexOf(entry) % 6) + 1})`} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        {/* Leyenda del PieChart: símbolo + porcentaje */}
        <CardContent className="pt-0 p-3 sm:p-6">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
            {allocationData.map((entry) => (
              <LegendItem
                key={entry.name}
                color={chartConfig[entry.name]?.color ?? `var(--chart-${(allocationData.indexOf(entry) % 6) + 1})`}
                label={`${entry.name} (${entry.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras: Ganancia/Pérdida por Activo (%) */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> Ganancia/Pérdida por Activo (%)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ChartContainer config={{ pl: { label: "G/P (%)" } }} className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  domain={[-30, 80]}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const symbol = payload[0].payload?.symbol as string;
                    const entry = plData.find((d) => d.symbol === symbol);
                    if (!entry) return null;
                    
                    const plValue = entry.plValue;
                    const plSign = plValue >= 0 ? '+' : '';
                    const isPositive = plValue >= 0;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.symbol}
                            </span>
                            <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                              {plSign}{formatCurrency(Math.abs(plValue))}
                            </span>
                            <span className="text-[0.70rem] text-muted-foreground">
                              {formatPercent(entry.pl)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="pl" radius={4}>
                  <LabelList
                    dataKey="symbol"
                    position="top"
                    offset={8}
                    className="fill-foreground caption font-medium"
                  />
                  {plData.map((entry) => (
                    <Cell
                      key={`cell-${entry.symbol}`}
                      fill={entry.pl >= 0 ? "var(--chart-2)" : "var(--chart-4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        {/* Leyenda del Gráfico de Barras: Ganancia / Pérdida */}
        <CardContent className="pt-0 p-3 sm:p-6">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-2">
            <LegendItem color="var(--chart-2)" label="Ganancia" />
            <LegendItem color="var(--chart-4)" label="Pérdida" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});