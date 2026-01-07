import { EconomicEvent } from '../types';

const API_KEY = 'jkXzor5yHJIpPtF7Tt18LBqFVooIP4Qs';
const BASE_URL = 'https://financialmodelingprep.com/stable/economic-calendar';

export interface DateRange {
    from?: string;
    to?: string;
}

export const fetchEconomicCalendar = async (range?: DateRange): Promise<EconomicEvent[]> => {
    try {
        const url = new URL(BASE_URL);
        url.searchParams.append('apikey', API_KEY);

        if (range?.from) {
            url.searchParams.append('from', range.from);
        }
        if (range?.to) {
            url.searchParams.append('to', range.to);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Error fetching economic calendar: ${response.statusText}`);
        }

        const data = await response.json();
        return data as EconomicEvent[];
    } catch (error) {
        console.error('Failed to fetch economic calendar', error);
        throw error;
    }
};
