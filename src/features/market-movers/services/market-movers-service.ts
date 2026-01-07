import { MarketMover } from '../types';

const API_KEY = 'f4bzqz8KWseH8PQcrMyxSjyu5HDf9jAO';
const BASE_URL = 'https://financialmodelingprep.com/stable';

export const fetchGainers = async (): Promise<MarketMover[]> => {
    try {
        const response = await fetch(`${BASE_URL}/biggest-gainers?apikey=${API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch gainers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching gainers:', error);
        return [];
    }
};

export const fetchLosers = async (): Promise<MarketMover[]> => {
    try {
        const response = await fetch(`${BASE_URL}/biggest-losers?apikey=${API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch losers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching losers:', error);
        return [];
    }
};

export const fetchActives = async (): Promise<MarketMover[]> => {
    try {
        const response = await fetch(`${BASE_URL}/most-actives?apikey=${API_KEY}`);
        if (!response.ok) throw new Error('Failed to fetch actives');
        return await response.json();
    } catch (error) {
        console.error('Error fetching actives:', error);
        return [];
    }
};
