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
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
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
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, currentPrice, ratio, ticker]);

  // Maneja el cambio entre input de 'shares' y 'cedears', convirtiendo los valores.
  const handleTypeChange = useCallback((newType: InputType) => {
    if (newType === inputType || !ratio) return;
    
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

    if (!isNaN(numQuantity) && !isNaN(numPrice)) {
      if (newType === 'cedears') {
        setQuantity((numQuantity * ratio).toFixed(2));
        setPrice((numPrice / ratio).toFixed(4));
      } else { // 'shares'
        setQuantity((numQuantity / ratio).toFixed(4));
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