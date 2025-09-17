import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useError } from '../../hooks/useError';
import Loader from '../ui/Loader';
import ModalPortal from '../ui/ModalPortal';
import { supabase } from '../../lib/supabase';

// Hook para obtener los ratios de CEDEARs
function useCedearRatios() {
  const [ratios, setRatios] = useState({});
  useEffect(() => {
    const fetchRatios = async () => {
      const { data, error } = await supabase.from('cedear_ratios').select('symbol,ratio');
      if (error) console.error("Error fetching CEDEAR ratios:", error);
      else {
        const ratiosMap = data.reduce((acc, item) => {
          acc[item.symbol] = item.ratio;
          return acc;
        }, {});
        setRatios(ratiosMap);
      }
    };
    fetchRatios();
  }, []);
  return ratios;
}

export default function AddTransactionModal({ isOpen, onClose, ticker, currentPrice }) {
  const { addTransaction } = usePortfolio();
  const { showSuccess, showError } = useError();
  const [loading, setLoading] = useState(false);
  
  const [inputType, setInputType] = useState('shares');
  const cedearRatios = useCedearRatios();
  const ratio = cedearRatios[ticker];

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // --- ✅ LÓGICA DE ACTUALIZACIÓN AUTOMÁTICA ---
  const handleTypeChange = useCallback((newType) => {
    if (newType === inputType || !ratio) return;

    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

      if (newType === 'cedears') {
        // De Acciones a CEDEARs
        setQuantity((numQuantity * ratio).toFixed(2));
        setPrice((numPrice / ratio).toFixed(4));
      } else {
        // De CEDEARs a Acciones
        setQuantity((numQuantity / ratio).toFixed(4));
        setPrice((numPrice * ratio).toFixed(2));
      }
    
    setInputType(newType);
  }, [inputType, quantity, price, ratio]);

  useEffect(() => {
    if (!isOpen) return;
    if (ratio && currentPrice) {
        setPrice((currentPrice / ratio).toFixed(4));
        setInputType('cedears');
    } else if (currentPrice) {
        setPrice(currentPrice.toFixed(2));
        setInputType('shares');
    }
    setQuantity('');
    setDate(new Date().toISOString().slice(0, 10));
  }, [isOpen, currentPrice, ratio, ticker]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
      showError("La fecha de la transacción no puede ser futura.");
      return;
    }

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      const enteredPrice = parseFloat(price);
      
      const finalQuantityInShares = inputType === 'cedears' && ratio ? enteredQuantity / ratio : enteredQuantity;
      const finalPricePerShare = inputType === 'cedears' && ratio ? enteredPrice * ratio : enteredPrice;

      await addTransaction({
        symbol: ticker,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: date,
        transaction_type: 'buy',
      });
      showSuccess(`¡${ticker} agregado a tu portafolio!`);
      onClose();
    } catch (error) {
      showError('No se pudo agregar la transacción.', { detail: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const isCedears = inputType === 'cedears';

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 animate-fade-in-fast p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-6 border border-blue-500/30 text-left max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-white mb-4">
            Agregar <span className="text-blue-400">{ticker}</span> al Portafolio
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {ratio && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de Activo</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleTypeChange('cedears')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${isCedears ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>CEDEARs (AR)</button>
                  <button type="button" onClick={() => handleTypeChange('shares')} className={`flex-1 p-2 rounded-md text-sm font-semibold ${!isCedears ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Acciones (EE.UU.)</button>
                </div>
                {isCedears && <p className="text-xs text-gray-400 mt-2">Ratio: {ratio} CEDEARs = 1 Acción.</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isCedears ? 'Cantidad de CEDEARs' : 'Cantidad de Acciones'}</label>
                <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={isCedears ? 'Ej: 15' : 'Ej: 1.5'} className="w-full bg-gray-700 p-2 rounded-md" required autoFocus />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{isCedears ? 'Precio por CEDEAR (USD)' : 'Precio por Acción (USD)'}</label>
                <input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={isCedears ? 'Ej: 17.50' : 'Ej: 175.00'} className="w-full bg-gray-700 p-2 rounded-md" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de Compra</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" disabled={loading} className="py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                {loading ? <Loader size="sm" color="white" /> : 'Guardar Activo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}