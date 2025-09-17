// src/components/portfolio/PortfolioView.jsx
import { useState, useMemo } from 'react';
import SellTransactionModal from './SellTransactionModal';
import AddTransactionModal from './AddTransactionModal';
import { usePortfolio } from '../../hooks/usePortfolio'; // ✨ NUEVO: Importar hook de portafolio
import { useError } from '../../hooks/useError'; // ✨ NUEVO: Importar hook de errores

// --- Icono de Papelera (para el botón de eliminar) ---
const TrashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SortIcon = ({ direction }) => (
  <span className="ml-1 text-xs opacity-70">
    {direction === 'asc' ? '▲' : '▼'}
  </span>
);

const useSortableData = (items) => {
  const [sortConfig, setSortConfig] = useState({ key: 'marketValue', direction: 'desc' });
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  return { items: sortedItems, requestSort, sortConfig };
};

const formatCurrency = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const formatPercent = (value) => `${value.toFixed(2)}%`;
const formatQuantity = (value) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

// ✅ CAMBIO: Se añade `onDelete`
function MobileHoldingCard({ holding, onBuy, onSell, onDelete }) {
  const plColor = holding.pl >= 0 ? 'text-green-400' : 'text-red-400';
  return (
    <article className="rounded-xl border border-gray-700 bg-gray-800/40 p-4 space-y-3 text-sm">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-semibold text-white tracking-wide">{holding.symbol}</h4>
        <div className="text-right">
          <div className="text-gray-400 text-xs">Valor Mercado</div>
          <div className="font-semibold text-white">{formatCurrency(holding.marketValue)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <div className="text-gray-400 text-xs">Cantidad</div>
          <div className="text-white font-medium">{formatQuantity(holding.quantity)}</div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-xs">Precio Prom.</div>
          <div className="text-white font-medium">{formatCurrency(holding.avgPurchasePrice)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">G/P ($)</div>
          <div className={`font-semibold ${plColor}`}>{formatCurrency(holding.pl)}</div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-xs">G/P (%)</div>
          <div className={`font-semibold ${plColor}`}>{formatPercent(holding.plPercent)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        <button onClick={() => onBuy(holding.symbol, holding.currentPrice)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded">Comprar</button>
        <button onClick={() => onSell(holding)} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded">Vender</button>
        {/* ✨ NUEVO: Botón de eliminar con ícono */}
        <button onClick={() => onDelete(holding.symbol)} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded" title="Eliminar activo y su historial">
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

// --- Componente Principal ---
export default function PortfolioView({ holdings, loading }) {
  const [sellModalHolding, setSellModalHolding] = useState(null);
  const [buyModalInfo, setBuyModalInfo] = useState({ isOpen: false, ticker: null, price: null });
  
  // ✨ NUEVO: Hooks para eliminar y mostrar errores/éxitos
  const { deleteAsset } = usePortfolio();
  const { showSuccess, showError } = useError();

  const holdingsWithMetrics = useMemo(() => {
    return holdings.map(holding => {
      const currentPrice = holding.assetData?.currentPrice || 0;
      const marketValue = holding.quantity * currentPrice;
      const pl = marketValue - holding.totalCost;
      const plPercent = holding.totalCost > 0 ? (pl / holding.totalCost) * 100 : 0;
      return { ...holding, currentPrice, marketValue, pl, plPercent };
    });
  }, [holdings]);

  const { items: sortedHoldings, requestSort, sortConfig } = useSortableData(holdingsWithMetrics);

  const handleOpenBuyModal = (ticker, price) => setBuyModalInfo({ isOpen: true, ticker, price });
  const handleOpenSellModal = (holding) => setSellModalHolding(holding);

  // ✨ NUEVO: Handler para eliminar el activo con confirmación
  const handleDeleteAsset = async (symbol) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${symbol} y todo su historial de transacciones? Esta acción no se puede deshacer.`)) {
      try {
        await deleteAsset(symbol);
        showSuccess(`El activo ${symbol} ha sido eliminado de tu portafolio.`);
      } catch (error) {
        showError('No se pudo eliminar el activo.', { detail: error.message });
      }
    }
  };
  
  const SortableHeader = ({ label, sortKey }) => (
    <th className="py-3 px-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center justify-end">
        {label}
        {sortConfig.key === sortKey && <SortIcon direction={sortConfig.direction} />}
      </div>
    </th>
  );

  if (loading) {
    return <p className="text-center text-gray-400 my-10">Calculando posiciones...</p>;
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">No tienes posiciones abiertas.</p>
        <p className="text-sm text-gray-500 mt-2">Agrega activos desde el Dashboard para comenzar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Posiciones Abiertas</h3>
        
        <div className="md:hidden space-y-3">
          {holdingsWithMetrics.map(holding => (
            <MobileHoldingCard 
              key={holding.symbol} 
              holding={holding} 
              onBuy={handleOpenBuyModal} 
              onSell={handleOpenSellModal}
              onDelete={handleDeleteAsset} // ✅ CAMBIO: Pasar handler
            />
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase">
              <tr>
                <th className="py-3 px-4 text-left cursor-pointer hover:bg-gray-700/50" onClick={() => requestSort('symbol')}>Activo {sortConfig.key === 'symbol' && <SortIcon direction={sortConfig.direction} />}</th>
                <SortableHeader label="Cantidad" sortKey="quantity" />
                <SortableHeader label="Precio Prom." sortKey="avgPurchasePrice" />
                <SortableHeader label="Precio Actual" sortKey="currentPrice" />
                <SortableHeader label="Valor Mercado" sortKey="marketValue" />
                <SortableHeader label="G/P ($)" sortKey="pl" />
                <SortableHeader label="G/P (%)" sortKey="plPercent" />
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedHoldings.map((holding) => (
                  <tr key={holding.symbol} className="hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-semibold text-white">{holding.symbol}</td>
                    <td className="py-3 px-4 text-right">{formatQuantity(holding.quantity)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(holding.avgPurchasePrice)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(holding.currentPrice)}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(holding.marketValue)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${holding.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(holding.pl)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${holding.plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(holding.plPercent)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenBuyModal(holding.symbol, holding.currentPrice)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-3 rounded">Comprar</button>
                        <button onClick={() => handleOpenSellModal(holding)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded">Vender</button>
                        {/* ✨ NUEVO: Botón de eliminar para desktop */}
                        <button onClick={() => handleDeleteAsset(holding.symbol)} className="p-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded" title="Eliminar activo y su historial">
                            <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <SellTransactionModal isOpen={!!sellModalHolding} onClose={() => setSellModalHolding(null)} holding={sellModalHolding} />
      <AddTransactionModal isOpen={buyModalInfo.isOpen} onClose={() => setBuyModalInfo({ isOpen: false, ticker: null, price: null })} ticker={buyModalInfo.ticker} currentPrice={buyModalInfo.price} />
    </>
  );
}