import { MarketMover } from '../types';
import { supabase } from '../../../lib/supabase';

/**
 * Fetches the biggest gainers in the market.
 * 
 * @returns Promise resolving to array of MarketMover objects sorted by highest percentage gain
 * @remarks Proxied through Supabase Edge Function to avoid CORS and rate limiting
 */
export const fetchGainers = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke<MarketMover[]>('fmp-proxy', {
            body: { endpointPath: 'stable/biggest-gainers' }
        });

        if (error) throw error;
        return data!;
    } catch (error) {
        console.error('Error fetching gainers:', error);
        return [];
    }
};

/**
 * Fetches the biggest losers in the market.
 * 
 * @returns Promise resolving to array of MarketMover objects sorted by highest percentage loss
 * @remarks Proxied through Supabase Edge Function to avoid CORS and rate limiting
 */
export const fetchLosers = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke<MarketMover[]>('fmp-proxy', {
            body: { endpointPath: 'stable/biggest-losers' }
        });

        if (error) throw error;
        return data!;
    } catch (error) {
        console.error('Error fetching losers:', error);
        return [];
    }
};

/**
 * Fetches the most actively traded stocks.
 * 
 * @returns Promise resolving to array of MarketMover objects sorted by trading volume
 * @remarks Proxied through Supabase Edge Function to avoid CORS and rate limiting
 */
export const fetchActives = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke<MarketMover[]>('fmp-proxy', {
            body: { endpointPath: 'stable/most-actives' }
        });

        if (error) throw error;
        return data!;
    } catch (error) {
        console.error('Error fetching actives:', error);
        return [];
    }
};
