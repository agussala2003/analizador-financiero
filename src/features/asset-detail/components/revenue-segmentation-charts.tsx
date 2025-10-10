// src/features/asset-detail/components/revenue-segmentation-charts.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Info, MapPin, PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { AssetData } from "../../../types/dashboard";

interface RevenueSegmentationChartsProps {
  asset: AssetData;
}

export const RevenueSegmentationCharts: React.FC<RevenueSegmentationChartsProps> = ({ asset }) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

    const renderCustomizedLabel = (props: {
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
        percent: number;
        [key: string]: unknown;
    }) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold pointer-events-none"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Ingresos por Geografía
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    {asset.geographicRevenue && asset.geographicRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={asset.geographicRevenue as { name: string; value: number; [key: string]: unknown }[]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    labelLine={false}
                                    label={renderCustomizedLabel as never}
                                >
                                    {asset.geographicRevenue.map((_entry, index) => (
                                        <Cell key={`cell-geo-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${(value / 1e9).toFixed(2)}B`} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Ingresos por Producto
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    {asset.productRevenue && asset.productRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={asset.productRevenue as { name: string; value: number; [key: string]: unknown }[]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    labelLine={false}
                                    label={renderCustomizedLabel as never}
                                >
                                    {asset.productRevenue.map((_entry, index) => (
                                        <Cell key={`cell-prod-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${(value / 1e9).toFixed(2)}B`} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
};