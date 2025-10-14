// src/hooks/useTransactionForm.ts

import { useState, useEffect, useCallback } from 'react';
import { useCedearRatios } from './use-cedear-ratios';

type InputType = 'shares' | 'cedears';

interface UseTransactionFormProps {
  isOpen: boolean;
  ticker: string | null;
  currentPrice: number | null;
}

/**
 * Hook para gestionar el estado y la lógica de los formularios de transacciones (compra/venta).
 * Encapsula el manejo de cantidad, precio, fecha y la conversión entre Acciones y CEDEARs.
 */
export const useTransactionForm = ({ isOpen, ticker, currentPrice }: UseTransactionFormProps) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [inputType, setInputType] = useState<InputType>('shares');
  
  const { ratios: cedearRatios } = useCedearRatios();
  const ratio = ticker ? cedearRatios[ticker] : undefined;

  // Resetea y establece los valores iniciales del formulario cuando el modal se abre.
  useEffect(() => {
    if (isOpen && ticker) {
      if (ratio && currentPrice) {
        setPrice((currentPrice / ratio).toFixed(4));
        setInputType('cedears');
      } else if (currentPrice) {
        setPrice(currentPrice.toFixed(2));
      } else {
        setPrice('');
      }
      setQuantity('');
      setDate(new Date());
    }
  }, [isOpen, currentPrice, ratio, ticker]);

  // Maneja el cambio entre input de 'shares' y 'cedears', convirtiendo los valores.
  const handleTypeChange = useCallback((newType: InputType) => {
    if (newType === inputType || !ratio) return;
    
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

    // Convertir cantidad solo si existe
    if (!isNaN(numQuantity) && numQuantity > 0) {
      if (newType === 'cedears') {
        setQuantity((numQuantity * ratio).toFixed(2));
      } else { // 'shares'
        setQuantity((numQuantity / ratio).toFixed(4));
      }
    }

    // Convertir precio siempre (incluso sin cantidad)
    if (!isNaN(numPrice) && numPrice > 0) {
      if (newType === 'cedears') {
        setPrice((numPrice / ratio).toFixed(4));
      } else { // 'shares'
        setPrice((numPrice * ratio).toFixed(2));
      }
    }

    setInputType(newType);
  }, [inputType, quantity, price, ratio]);
  
  const isCedears = inputType === 'cedears';

  return {
    quantity, setQuantity,
    price, setPrice,
    date, setDate,
    inputType, handleTypeChange,
    ratio, isCedears,
  };
};