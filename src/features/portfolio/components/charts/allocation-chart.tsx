
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "../../../../components/charts/lazy-recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { PieChart as PieChartIcon, Globe } from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";
import type { AllocationChartProps } from "../../types/portfolio.types";

const COLORS = [
    'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
    'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)',
    'var(--chart-7)', 'var(--chart-8)', 'var(--chart-9)',
    'var(--chart-10)'
];

export function AllocationChart({ data, title, description, type, isLoading }: AllocationChartProps) {
    const Icon = type === 'sector' ? PieChartIcon : Globe;

    const chartData = useMemo(() => {
        // Filter out very small segments (< 1%) into "Otros" if too many segments
        if (data.length <= 10) return data;

        const main = data.slice(0, 9);
        const others = data.slice(9);
        const otherValue = others.reduce((sum, item) => sum + item.value, 0);
        const otherPercentage = others.reduce((sum, item) => sum + item.percentage, 0);

        return [
            ...main,
            { name: 'Otros', value: otherValue, percentage: otherPercentage }
        ];
    }, [data]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    No hay datos suficientes para mostrar el gráfico.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="hsl(var(--card))" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ fontSize: '12px' }}
                                formatter={(value: string, _entry: unknown, index: number) => {
                                    const percent = chartData[index]?.percentage.toFixed(1) + '%';
                                    return <span className="text-foreground ml-1">{value} ({percent})</span>;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
