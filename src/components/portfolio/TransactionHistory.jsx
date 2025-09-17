import { useState, useMemo } from 'react';

// --- Helpers de Formato ---
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatQuantity = (value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });


// --- ✅ NUEVO: Componente de Tarjeta para Móviles ---
function MobileTransactionCard({ tx }) {
  const isBuy = tx.transaction_type === 'buy';
  const typeColor = isBuy ? 'text-green-400' : 'text-red-400';
  const typeLabel = isBuy ? 'Compra' : 'Venta';

  return (
    <article className="rounded-xl border border-gray-700 bg-gray-800/40 p-4 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-white">{tx.symbol}</h4>
          <p className={`font-semibold ${typeColor}`}>{typeLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-xs">Valor Total</div>
          <div className="font-semibold text-white">{formatCurrency(tx.quantity * tx.purchase_price)}</div>
        </div>
      </div>
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-700 text-xs">
        <div className="text-gray-400">
          {formatQuantity(tx.quantity)} @ {formatCurrency(tx.purchase_price)}
        </div>
        <div className="text-gray-400">{formatDate(tx.purchase_date)}</div>
      </div>
    </article>
  );
}

// --- Componente de Paginación ---
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="px-3 py-1 rounded-md bg-gray-700 disabled:opacity-50">‹</button>
      <span className="text-sm text-gray-400">Página {currentPage + 1} de {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-3 py-1 rounded-md bg-gray-700 disabled:opacity-50">›</button>
    </div>
  );
};

// --- Componente Principal ---
export default function TransactionHistory({ transactions }) {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const { pagedTransactions, totalPages } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { pagedTransactions: [], totalPages: 0 };
    }
    const total = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      pagedTransactions: transactions.slice(start, end),
      totalPages: total,
    };
  }, [transactions, currentPage]);

  if (transactions.length === 0) return null;

  return (
    <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700 mt-5">
      <h3 className="text-xl font-bold text-white mb-4">Historial de Transacciones</h3>
      
      {/* ✅ VISTA MÓVIL */}
      <div className="md:hidden space-y-3">
        {pagedTransactions.map(tx => <MobileTransactionCard key={tx.id} tx={tx} />)}
      </div>
      
      {/* ✅ VISTA DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Activo</th>
              <th className="py-2 px-4 text-left">Tipo</th>
              <th className="py-2 px-4 text-right">Cantidad</th>
              <th className="py-2 px-4 text-right">Precio</th>
              <th className="py-2 px-4 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {pagedTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-700/20">
                <td className="py-2 px-4 text-gray-300">{formatDate(tx.purchase_date)}</td>
                <td className="py-2 px-4 font-medium text-white">{tx.symbol}</td>
                <td className={`py-2 px-4 font-semibold ${tx.transaction_type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{tx.transaction_type === 'buy' ? 'Compra' : 'Venta'}</td>
                <td className="py-2 px-4 text-right">{formatQuantity(tx.quantity)}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(tx.purchase_price)}</td>
                <td className="py-2 px-4 text-right font-medium">{formatCurrency(tx.quantity * tx.purchase_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}