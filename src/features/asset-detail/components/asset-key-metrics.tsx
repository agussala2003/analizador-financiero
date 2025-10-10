// src/features/asset-detail/components/asset-key-metrics.tsx

import React from 'react';
import { Card, CardContent } from "../../../components/ui/card";
import { AssetData } from "../../../types/dashboard";

interface KeyMetricProps {
    label: string;
    value: React.ReactNode;
}
const KeyMetric: React.FC<KeyMetricProps> = ({ label, value }) => (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-base font-bold text-foreground min-h-6 flex items-center justify-center sm:justify-start">
            {value}
        </p>
    </div>
);

const formatLargeNumber = (num: number | string): string => {
    const n = Number(num);
    if (isNaN(n)) return "N/A";
    if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    return n.toLocaleString("es-ES");
};

interface AssetKeyMetricsProps {
    asset: AssetData;
}

export const AssetKeyMetrics: React.FC<AssetKeyMetricsProps> = ({ asset }) => {
    return (
        <Card>
            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <KeyMetric label="Market Cap" value={`$${formatLargeNumber(asset.marketCap)}`} />
                <KeyMetric label="Volumen" value={formatLargeNumber(asset.volume)} />
                <KeyMetric label="Vol. Promedio" value={formatLargeNumber(asset.averageVolume)} />
                <KeyMetric label="Beta" value={typeof asset.beta === 'number' ? asset.beta.toFixed(2) : "N/A"} />
                <KeyMetric label="Rango 52 Semanas" value={typeof asset.range === 'string' ? asset.range : "N/A"} />
                <KeyMetric
                    label="Último Dividendo"
                    value={typeof asset.lastDividend === 'number' && asset.lastDividend > 0 ? `$${asset.lastDividend.toFixed(2)}` : "N/A"}
                />
            </CardContent>
        </Card>
    );
};