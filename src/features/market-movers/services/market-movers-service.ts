import { MarketMover } from '../types';
import { supabase } from '../../../lib/supabase';

export const fetchGainers = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
            body: { endpointPath: 'stable/biggest-gainers' }
        });

        if (error) throw error;
        return data as MarketMover[];
    } catch (error) {
        console.error('Error fetching gainers:', error);
        return [];
    }
};

export const fetchLosers = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
            body: { endpointPath: 'stable/biggest-losers' }
        });

        if (error) throw error;
        return data as MarketMover[];
    } catch (error) {
        console.error('Error fetching losers:', error);
        return [];
    }
};

export const fetchActives = async (): Promise<MarketMover[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
            body: { endpointPath: 'stable/most-actives' }
        });

        if (error) throw error;
        return data as MarketMover[];
    } catch (error) {
        console.error('Error fetching actives:', error);
        return [];
    }
};
