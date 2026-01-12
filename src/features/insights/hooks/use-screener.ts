
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useConfig } from '../../../hooks/use-config';
import type { AssetData } from '../../../types/dashboard';

/**
 * Interfaz para el resultado del screener con campos precalculados
 * para facilitar el filtrado y rendering en la UI.
 */
export interface ScreenerAsset {
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  // Campos precalculados desde ratios
  PER?: number;
  pegRatio?: number;
  priceToBook?: number;
  dividendYield?: number;
  roe?: number;
}

export function useScreenerData() {
    const config = useConfig();
    const hours = config.insights?.updatedWithinHours ?? 48;

    return useQuery<ScreenerAsset[]>({
        queryKey: ['screener-data', hours],
        queryFn: async () => {
            const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('asset_data_cache')
                .select('symbol, data, last_updated_at')
                .gte('last_updated_at', cutoff)
                .not('symbol', 'like', 'stock_grades_%')
                .limit(5000);

            if (error) throw error;

            // Helper to validate AssetData
            const isAssetData = (x: unknown): x is AssetData => {
                if (!x || typeof x !== 'object') return false;
                const obj = x as Record<string, unknown>;
                return 'quote' in obj && 'profile' in obj && 'ratios' in obj;
            };

            // Transform to ScreenerAsset[] - filtrar ETFs y fondos
            const assets = (data ?? [])
                .map((row: { symbol: string; data: unknown; last_updated_at: string }) => {
                    const d = row.data;
                    if (!isAssetData(d)) return null;

                    // Filtrar ETFs y fondos directamente usando el campo isEtf
                    if (d.profile.isEtf === true || d.profile.isFund === true) return null;

                    // Usar el último período de ratios disponible
                    const latestRatios = d.ratios?.[0];
                    
                    const per = latestRatios?.priceToEarningsRatio;
                    const peg = latestRatios?.priceToEarningsGrowthRatio;
                    
                    // Filtrar también activos que no tengan P/E ni PEG válidos
                    const hasValidPE = typeof per === 'number' && isFinite(per);
                    const hasValidPEG = typeof peg === 'number' && isFinite(peg);
                    if (!hasValidPE && !hasValidPEG) return null;
                    
                    return {
                        symbol: d.profile.symbol,
                        companyName: d.profile.companyName,
                        sector: d.profile.sector,
                        currentPrice: d.quote.price,
                        PER: hasValidPE ? per : undefined,
                        pegRatio: hasValidPEG ? peg : undefined,
                        priceToBook: latestRatios?.priceToBookRatio,
                        dividendYield: latestRatios?.dividendYield,
                        roe: d.keyMetrics?.returnOnEquityTTM,
                    };
                })
                .filter(d => d !== null) as ScreenerAsset[];

            return assets;
        },
        staleTime: 10 * 60 * 1000, // 10 mins
    });
}
