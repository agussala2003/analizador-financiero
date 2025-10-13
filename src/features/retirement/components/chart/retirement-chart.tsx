// src/features/retirement/components/chart/retirement-chart.tsx

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "../../../../components/ui/chart";
import { RetirementChartProps } from "../../types/retirement.types";
import { formatCurrency } from "../../lib/retirement.utils";

const chartConfig: ChartConfig = {
  "Solo Ahorro": {
    label: "Solo Ahorro",
    color: "hsl(var(--chart-3))",
  },
  Invirtiendo: {
    label: "Invirtiendo",
    color: "hsl(var(--chart-1))",
  },
};

/**
 * Gráfico de área que muestra la proyección de crecimiento
 */
export function RetirementChart({ chartData }: RetirementChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value))}
            tickLine={false}
            axisLine={false}
            width={80}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend />
          <defs>
            <linearGradient id="fillAhorro" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-Solo Ahorro)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--color-Solo Ahorro)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="fillInvirtiendo" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-Invirtiendo)"
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor="var(--color-Invirtiendo)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="Solo Ahorro"
            stackId="1"
            stroke="var(--color-Solo Ahorro)"
            fill="url(#fillAhorro)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Invirtiendo"
            stackId="1"
            stroke="var(--color-Invirtiendo)"
            fill="url(#fillInvirtiendo)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
