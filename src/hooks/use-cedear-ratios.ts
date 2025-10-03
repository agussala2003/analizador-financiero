import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCedearRatios() {
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatios = async () => {
      try {
        const { data, error } = await supabase.from('cedear_ratios').select('symbol,ratio');
        if (error) throw error;
        const map = data.reduce((acc, item) => {
          acc[item.symbol] = item.ratio;
          return acc;
        }, {} as Record<string, number>);
        setRatios(map);
      } catch (err) {
        console.error('Error fetching CEDEAR ratios:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchRatios();
  }, []);

  return { ratios, loading };
}