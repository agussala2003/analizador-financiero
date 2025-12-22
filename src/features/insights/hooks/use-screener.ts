
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useConfig } from '../../../hooks/use-config';
import type { AssetData } from '../../../types/dashboard';

export interface ScreenerFilters {
    sector?: string;
    minMarketCap?: number;
    maxPe?: number;
    maxPeg?: number;
    minDividendYield?: number;
    minGrowth?: number; // Revenue or EPS growth
    lynchCategory?: 'fastGrower' | 'stalwart' | 'slowGrower' | 'assetPlay';
}

export function useScreenerData() {
    const config = useConfig();
    const hours = config.insights?.updatedWithinHours ?? 48;

    return useQuery<AssetData[]>({
        queryKey: ['screener-data', hours],
        queryFn: async () => {
            const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('asset_data_cache')
                .select('symbol, data, last_updated_at')
                .gte('last_updated_at', cutoff)
                .limit(5000);

            if (error) throw error;

            // Helper to validate AssetData
            const isAssetData = (x: unknown): x is AssetData =>
                !!x && typeof x === 'object' && 'symbol' in (x as any) && 'currentPrice' in (x as any);

            // Transform to AssetData[]
            const assets: AssetData[] = (data || [])
                .map(row => {
                    const d = row.data;
                    if (isAssetData(d)) return d;
                    return null;
                })
                .filter((d): d is AssetData => d !== null);

            return assets;
        },
        staleTime: 10 * 60 * 1000, // 10 mins
    });
}
