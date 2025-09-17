import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useError } from '../../hooks/useError';
import Loader from '../ui/Loader';
import ModalPortal from '../ui/ModalPortal';
import { supabase } from '../../lib/supabase';

// Reutilizamos el hook
function useCedearRatios() {
  const [ratios, setRatios] = useState({});
  useEffect(() => {
    const fetchRatios = async () => {
      const { data } = await supabase.from('cedear_ratios').select('symbol,ratio');
      if (data) {
        const ratiosMap = data.reduce((acc, item) => { acc[item.symbol] = item.ratio; return acc; }, {});
        setRatios(ratiosMap);
      }
    };
    fetchRatios();
  }, []);
  return ratios;
}

export default function SellTransactionModal({ isOpen, onClose, holding }) {
  const { addTransaction } = usePortfolio();
  const { showSuccess, showError } = useError();
  const [loading, setLoading] = useState(false);
  
  const [inputType, setInputType] = useState('shares');
  const cedearRatios = useCedearRatios();
  const ratio = holding ? cedearRatios[holding.symbol] : null;
  
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // --- ✅ LÓGICA CORREGIDA ---
  const handleTypeChange = useCallback((newType) => {
    if (newType === inputType || !ratio) return;

    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

      if (newType === 'cedears') { // De Acciones a CEDEARs
        setQuantity((numQuantity * ratio).toFixed(2));
        setPrice((numPrice / ratio).toFixed(4));
      } else { // De CEDEARs a Acciones
        setQuantity((numQuantity / ratio).toFixed(4));
        setPrice((numPrice * ratio).toFixed(2));
      }
    setInputType(newType);
  }, [inputType, quantity, price, ratio]);

  useEffect(() => {
    if (!isOpen || !holding) return;
    const currentPricePerShare = holding?.assetData?.currentPrice;
    if (ratio && currentPricePerShare) {
      setPrice((currentPricePerShare / ratio).toFixed(4));
      setInputType('cedears');
    } else if (currentPricePerShare) {
      setPrice(currentPricePerShare.toFixed(2));
      setInputType('shares');
    }
    setQuantity('');
    setDate(new Date().toISOString().slice(0, 10));
  }, [isOpen, holding, ratio]);

  if (!isOpen || !holding) return null;
  
  const isCedears = inputType === 'cedears';
  const maxShares = holding.quantity;
  const maxCedears = ratio ? maxShares * ratio : 0;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
      showError("La fecha de la transacción no puede ser futura.");
      return;
    }

    const enteredQuantity = parseFloat(quantity);
    const enteredPrice = parseFloat(price);
    
    const finalQuantityInShares = isCedears && ratio ? enteredQuantity / ratio : enteredQuantity;
    const finalPricePerShare = isCedears && ratio ? enteredPrice * ratio : enteredPrice;

    if (finalQuantityInShares > maxShares) {
      showError(`No puedes vender más de lo que posees (${isCedears ? maxCedears.toFixed(2) + ' CEDEARs' : maxShares.toFixed(4) + ' acciones'}).`);
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        symbol: holding.symbol,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare, // precio de venta
        purchase_date: date,
        transaction_type: 'sell',
      });
      showSuccess(`Venta registrada para ${holding.symbol} con éxito.`);
      onClose();
    } catch (error) {
      showError('No se pudo registrar la venta.', { detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 animate-fade-in-fast p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-6 border border-red-500/30 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-white mb-2">
            Vender <span className="text-red-400">{holding.symbol}</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Posees: <span className="font-bold text-white">{maxShares.toFixed(4)} acciones</span>
            {ratio && ` (equiv. a ${maxCedears.toFixed(2)} CEDEARs)`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {ratio && (
              <div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleTypeChange('cedears')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${isCedears ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Vender CEDEARs</button>
                  <button type="button" onClick={() => handleTypeChange('shares')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${!isCedears ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Vender Acciones</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cantidad a Vender</label>
                <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} max={isCedears ? maxCedears : maxShares} className="w-full bg-gray-700 p-2 rounded-md" required autoFocus />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isCedears ? 'Precio por CEDEAR (USD)' : 'Precio por Acción (USD)'}</label>
                <input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de Venta</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" disabled={loading} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-500">
                {loading ? <Loader size="sm" color="white" /> : 'Confirmar Venta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}