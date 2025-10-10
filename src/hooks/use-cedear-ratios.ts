// src/hooks/use-cedear-ratios.ts

import { useState, useEffect } from 'react';
// ✅ Importamos la nueva función del servicio
import { fetchCedearRatios } from '../services/data/cedear-service';

/**
 * Hook personalizado para obtener y cachear los ratios de conversión de CEDEARs.
 * * @returns {{ ratios: Record<string, number>, loading: boolean }} - Un objeto con los ratios y el estado de carga.
 */
export function useCedearRatios() {
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usamos una función autoejecutable para poder usar async/await dentro del useEffect.
    const loadRatios = async () => {
      setLoading(true);
      const fetchedRatios = await fetchCedearRatios();
      setRatios(fetchedRatios);
      setLoading(false);
    };

    void loadRatios();
  }, []); // El array vacío asegura que esto se ejecute solo una vez.

  return { ratios, loading };
}