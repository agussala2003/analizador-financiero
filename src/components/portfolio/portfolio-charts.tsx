import { useMemo } from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "../ui/chart";
import { Holding } from "../../types/portfolio";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

// --- Funciones de formato ---
const formatCurrency = (value: number) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const formatPercent = (value: number) => `${Number(value || 0).toFixed(2)}%`;

// --- Hook para procesar y configurar los datos de los gráficos ---
const useChartData = (holdings: Holding[]) => {
  return useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return { allocationData: [], plData: [], chartConfig: {} };
    }

    const totalValue = holdings.reduce(
      (acc, h) => acc + h.quantity * (h.assetData.currentPrice || 0),
      0
    );

    const allocationData = holdings.map((h) => {
      const value = h.quantity * (h.assetData.currentPrice || 0);
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return {
        name: h.symbol,
        value,
        percentage,
      };
    });

    const plData = holdings.map((h) => {
      const marketValue = h.quantity * (h.assetData.currentPrice || 0);
      const plPercent = h.totalCost > 0 ? ((marketValue - h.totalCost) / h.totalCost) * 100 : 0;
      return {
        symbol: h.symbol,
        pl: plPercent,
      };
    });

    // Configuración de colores para el pie chart (máximo 6)
    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
      "var(--chart-6)",
    ];

    const chartConfig: ChartConfig = {};
    allocationData.forEach((item, index) => {
      chartConfig[item.name] = {
        label: item.name,
        color: colors[index % colors.length],
      };
    });

    return { allocationData, plData, chartConfig, totalValue };
  }, [holdings]);
};

// --- Componente de Leyenda Genérico ---
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-sm font-medium text-foreground">{label}</span>
  </div>
);

// --- Componente principal de Gráficos ---
export function PortfolioCharts({ holdings }: { holdings: Holding[] }) {
  const { allocationData, plData, chartConfig } = useChartData(holdings);

  if (holdings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico Circular: Distribución de Activos */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" /> Distribución de Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const entry = allocationData.find((d) => d.name === name);
                        return [formatCurrency(entry?.value || 0), `${name} (${entry?.percentage.toFixed(1)}%)`];
                      }}
                      hideLabel
                    />
                  }
                />
                <Pie data={allocationData} dataKey="value" nameKey="name">
                  {allocationData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        {/* Leyenda del PieChart: símbolo + porcentaje */}
        <CardContent className="pt-0">
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {allocationData.map((entry) => (
              <LegendItem
                key={entry.name}
                color={chartConfig[entry.name]?.color || `var(--chart-${(allocationData.indexOf(entry) % 6) + 1})`}
                label={`${entry.name} (${entry.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras: Ganancia/Pérdida por Activo (%) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Ganancia/Pérdida por Activo (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ pl: { label: "G/P (%)" } }} className="h-[300px] w-full">
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
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      hideIndicator
                      formatter={(value) => formatPercent(Number(value))}
                    />
                  }
                />
                <Bar dataKey="pl" radius={4}>
                  <LabelList
                    dataKey="symbol"
                    position={(props: any) => (props.value >= 0 ? "top" : "bottom")}
                    offset={8}
                    className="fill-foreground text-xs font-medium"
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
        <CardContent className="pt-0">
          <div className="flex flex-wrap justify-center gap-6 mt-2">
            <LegendItem color="var(--chart-2)" label="Ganancia" />
            <LegendItem color="var(--chart-4)" label="Pérdida" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}