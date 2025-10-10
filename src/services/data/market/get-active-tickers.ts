// src/services/data/market/getActiveTickers.ts

import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/logger';

// Tipos específicos para este servicio
interface TickerData {
  dayChange: number;
}

export interface ActiveTicker {
  symbol: string;
  data: TickerData;
  last_updated_at: string;
}

/**
 * Obtiene los activos de la tabla de caché que han sido actualizados hoy.
 * Filtra los datos para asegurar que tengan la estructura correcta y un símbolo válido.
 * @returns {Promise<ActiveTicker[]>} - Una lista de activos con su cambio diario.
 */
export const getActiveTickers = async (): Promise<Omit<ActiveTicker, 'last_updated_at'>[]> => {
  try {
    // Obtenemos la fecha de hoy en formato YYYY-MM-DD para la zona horaria local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('asset_data_cache')
      .select('symbol, data, last_updated_at')
      // ✅ Filtra para obtener solo los registros actualizados hoy o después
      .gte('last_updated_at', `${todayISO}T00:00:00.000Z`);

    if (error) throw error;
    if (!data) return [];

    const filteredData = data.filter((item): item is ActiveTicker => {
      if (!item.symbol || typeof item.symbol !== 'string') return false;
      if (item.symbol.includes(' ') || item.symbol.includes('-')) return false;
      if (!item.data || typeof (item.data as TickerData).dayChange !== 'number') return false;
      return true;
    });

    return filteredData.map(({ symbol, data }) => ({ symbol, data: { dayChange: data.dayChange } }));

  } catch (error) {
    await logger.error('GET_ACTIVE_TICKERS_FAILED', error instanceof Error ? error.message : 'Unknown error');
    return []; // Devolvemos un array vacío en caso de error
  }
};