import { EconomicEvent } from '../types';
import { supabase } from '../../../lib/supabase';

export const fetchEconomicCalendar = async (): Promise<EconomicEvent[]> => {
    try {
        const endpointPath = `stable/economic-calendar`;

        const { data, error } = await supabase.functions.invoke<EconomicEvent[]>('fmp-proxy', {
            body: { endpointPath }
        });

        if (error) throw error;
        return data!;

    } catch (error) {
        console.error('Failed to fetch economic calendar', error);
        throw error;
    }
};
