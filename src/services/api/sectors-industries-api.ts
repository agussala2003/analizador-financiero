// src/services/api/sectors-industries-api.ts

import { supabase } from '../../lib/supabase';
import type { 
  Industry, 
  Sector, 
  HistoricalIndustryPerformance, 
  HistoricalSectorPerformance 
} from '../../features/sectors-industries/types';

/**
 * Fetches the list of available industries from the FMP API via Supabase Edge Function.
 * 
 * @returns Promise resolving to an array of industries
 * @throws Error if the API call fails or returns invalid data
 */
export async function fetchAvailableIndustries(): Promise<Industry[]> {
  const { data, error } = await supabase.functions.invoke('fmp-proxy', {
    body: { 
      endpointPath: 'stable/available-industries'
    }
  });

  if (error) {
    console.error('Error fetching available industries:', error);
    throw new Error('Failed to fetch available industries');
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from industries endpoint');
  }

  return data as Industry[];
}

/**
 * Fetches the list of available sectors from the FMP API via Supabase Edge Function.
 * 
 * @returns Promise resolving to an array of sectors
 * @throws Error if the API call fails or returns invalid data
 */
export async function fetchAvailableSectors(): Promise<Sector[]> {
  const { data, error } = await supabase.functions.invoke('fmp-proxy', {
    body: { 
      endpointPath: 'stable/available-sectors'
    }
  });

  if (error) {
    console.error('Error fetching available sectors:', error);
    throw new Error('Failed to fetch available sectors');
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from sectors endpoint');
  }

  return data as Sector[];
}

/**
 * Fetches historical performance data for a specific industry.
 * 
 * @param industry - Name of the industry to fetch performance for
 * @returns Promise resolving to an array of historical performance data
 * @throws Error if the API call fails or returns invalid data
 */
export async function fetchIndustryPerformance(
  industry: string
): Promise<HistoricalIndustryPerformance[]> {
  const { data, error } = await supabase.functions.invoke('fmp-proxy', {
    body: { 
      endpointPath: `stable/historical-industry-performance?industry=${encodeURIComponent(industry)}`
    }
  });

  if (error) {
    console.error(`Error fetching performance for industry ${industry}:`, error);
    throw new Error(`Failed to fetch performance for industry: ${industry}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from industry performance endpoint');
  }

  return data as HistoricalIndustryPerformance[];
}

/**
 * Fetches historical performance data for a specific sector.
 * 
 * @param sector - Name of the sector to fetch performance for
 * @returns Promise resolving to an array of historical performance data
 * @throws Error if the API call fails or returns invalid data
 */
export async function fetchSectorPerformance(
  sector: string
): Promise<HistoricalSectorPerformance[]> {
  const { data, error } = await supabase.functions.invoke('fmp-proxy', {
    body: { 
      endpointPath: `stable/historical-sector-performance?sector=${encodeURIComponent(sector)}`
    }
  });

  if (error) {
    console.error(`Error fetching performance for sector ${sector}:`, error);
    throw new Error(`Failed to fetch performance for sector: ${sector}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from sector performance endpoint');
  }

  return data as HistoricalSectorPerformance[];
}
