// src/features/asset-detail/components/asset-financials-tab.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DollarSign, BarChart3, ShieldCheck } from "lucide-react";
import { indicatorConfig } from "../../../utils/financial";
import { AssetData } from "../../../types/dashboard";

const financialSections = [
    {
        title: "Valoración",
        icon: <DollarSign className="w-4 h-4" />,
        keys: ["PER", "priceToBook", "priceToSales", "pfc_ratio", "evToEbitda", "earningsYield"],
    },
    {
        title: "Rentabilidad",
        icon: <BarChart3 className="w-4 h-4" />,
        keys: ["roe", "roa", "roic", "operatingMargin", "grossMargin"],
    },
    {
        title: "Salud Financiera",
        icon: <ShieldCheck className="w-4 h-4" />,
        keys: ["debtToEquity", "currentRatio", "netDebtToEBITDA", "payout_ratio"],
    },
];

interface AssetFinancialsTabProps {
    asset: AssetData;
}

export const AssetFinancialsTab: React.FC<AssetFinancialsTabProps> = ({ asset }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {financialSections.map((section) => (
                <Card key={section.title}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {section.icon} {section.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {section.keys.map((key) => {
                                const config = indicatorConfig[key as keyof typeof indicatorConfig];
                                const value = asset.data?.[key];
                                const displayValue =
                                    typeof value === "number"
                                        ? `${value.toFixed(2)}${config?.asPercent ? "%" : ""}`
                                        : "N/A";
                                return (
                                    <li
                                        key={key}
                                        className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-none"
                                    >
                                        <span className="text-muted-foreground">{config?.label || key}</span>
                                        <span className="font-semibold">
                                            {displayValue === "N/A" ? (
                                                <span className="text-muted-foreground">N/A</span>
                                            ) : (
                                                displayValue
                                            )}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};