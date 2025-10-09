// src/services/data/cedearService.ts

import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

/**
 * Obtiene los ratios de conversión de CEDEARs desde la base de datos.
 * @returns {Promise<Record<string, number>>} - Un objeto (mapa) donde la clave es el símbolo del activo y el valor es su ratio de conversión.
 */
export const fetchCedearRatios = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase.from('cedear_ratios').select('symbol,ratio');

    if (error) {
      throw error;
    }

    // Convertimos el array de objetos en un mapa para un acceso más eficiente (ej: ratios['AAPL'])
    const ratiosMap = data.reduce((acc, item) => {
      acc[item.symbol] = item.ratio;
      return acc;
    }, {} as Record<string, number>);
    
    return ratiosMap;

  } catch (err: any) {
    logger.error('CEDEAR_RATIOS_FETCH_FAILED', 'No se pudieron obtener los ratios de CEDEARs.', {
      errorMessage: err.message,
    });
    // Devolvemos un objeto vacío en caso de error para no romper la aplicación.
    return {};
  }
};