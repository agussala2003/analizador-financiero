import { useEffect, useState } from "react";
import { fmtDate } from "../../utils/financial";

export default function DividendCalculatorModal({ isOpen, onClose, item }) {
  const [shares, setShares] = useState('');

  
  // Efecto para cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const dividendPerShare = item.dividend ?? 0;
  const numShares = parseFloat(shares) || 0;
  const totalAmount = numShares * dividendPerShare;

  // Formateador para moneda USD
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in-fast p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-6 border border-blue-500/30 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">Calculadora de Dividendos para <span className="text-blue-400">{item.symbol}</span></h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <label htmlFor="shares-input" className="block text-gray-400 mb-1">Cantidad de acciones (nominales)</label>
            <input
              id="shares-input"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Ej: 150"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Dividendo por Acción:</span>
              <span className="font-semibold text-white">{currencyFormatter.format(dividendPerShare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fecha de Pago:</span>
              <span className="font-semibold text-white">{fmtDate(item.paymentDate)}</span>
            </div>
          </div>
          
          <div className="text-center bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-gray-300">Total a recibir (bruto):</p>
            <p className="text-2xl font-bold text-green-300 mt-1">
              {currencyFormatter.format(totalAmount)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="cursor-pointer mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-transform hover:scale-105"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}