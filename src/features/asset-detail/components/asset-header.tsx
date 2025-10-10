// src/features/asset-detail/components/asset-header.tsx

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { AssetData } from '../../../types/dashboard';

interface AssetHeaderProps {
    asset: AssetData;
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({ asset }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
                src={asset.image}
                alt={asset.companyName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border object-contain bg-background shadow-sm"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = "/placeholder.svg";
                }}
            />
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">{asset.companyName} ({asset.symbol})</h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                    {asset.exchangeFullName}
                </p>
                <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold">${asset.currentPrice.toFixed(2)}</span>
                    <span
                        className={`flex items-center gap-1 text-lg font-semibold ${
                            asset.dayChange >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {asset.dayChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {Math.abs(asset.dayChange).toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
};