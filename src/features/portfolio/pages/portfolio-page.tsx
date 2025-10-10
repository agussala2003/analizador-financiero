// src/pages/PortfolioPage.tsx
import { useState, useMemo } from 'react';
import { usePortfolio } from '../../../hooks/use-portfolio';
import { motion } from 'framer-motion';
import { Skeleton } from '../../../components/ui/skeleton';
import { LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { PortfolioStats } from '../components/portfolio-stats';
import { PortfolioCharts } from '../components/portfolio-charts';
import { PortfolioView } from '../components/portfolio-view';
import { TransactionHistory } from '../components/transaction-history';
import { AddTransactionModal } from '../components/add-transaction-modal';
import { SellTransactionModal } from '../components/sell-transaction-modal';
import { HoldingWithMetrics } from '../../../types/portfolio';

const PortfolioSkeleton = () => (
  <div className="space-y-6 container mx-auto p-4 sm:p-6 lg:p-8">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);
export default function PortfolioPage() {
  const { holdings, transactions, totalPerformance, loading, deleteAsset, portfolioData } = usePortfolio();

  interface AddModalInfo {
    isOpen: boolean;
    ticker: string | null;
    price: number | null;
  }
  const [addModalInfo, setAddModalInfo] = useState<AddModalInfo>({
    isOpen: false,
    ticker: null,
    price: null,
  });
  const [sellModalHolding, setSellModalHolding] = useState<HoldingWithMetrics | null>(null);

  const handleOpenAddModal = (ticker: string, price: number) =>
    setAddModalInfo({ isOpen: true, ticker, price });

  const handleOpenSellModal = (holding: HoldingWithMetrics) => setSellModalHolding(holding);

  const handleDeleteAsset = async (symbol: string) => {
    try {
      await deleteAsset(symbol);
      toast.success(`Activo ${symbol} eliminado correctamente.`);
    } catch (error: unknown) {
      const msg = (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
        ? (error as { message: string }).message
        : JSON.stringify(error);
      toast.error('Error al eliminar el activo.', { description: msg });
    }
  };

  // Precomputar holdings con métricas solo si no está cargando
  const holdingsWithMetrics = useMemo(() => {
    if (loading || !holdings) return [];
    return holdings.map((h) => {
  const currentPrice = portfolioData[h.symbol]?.currentPrice ?? 0;
      const marketValue = h.quantity * currentPrice;
      const pl = marketValue - h.totalCost;
      const plPercent = h.totalCost > 0 ? (pl / h.totalCost) * 100 : 0;
      return { ...h, currentPrice, marketValue, pl, plPercent };
    });
  }, [holdings, portfolioData, loading]);

  if (loading) return <PortfolioSkeleton />;

  return (
    <>
      <motion.div
        className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 pb-4 mb-6 border-b">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Portafolio</h1>
            <p className="text-muted-foreground">Un resumen de tus inversiones, rendimiento y distribución.</p>
          </div>
        </div>

        <PortfolioStats
          holdings={holdings}
          totalPerformance={totalPerformance}
          portfolioData={portfolioData}
        />
        <PortfolioCharts holdings={holdings} />
        <PortfolioView
          holdings={holdingsWithMetrics}
          onDeleteAsset={(symbol) => { void handleDeleteAsset(symbol); }}
          onAddMore={handleOpenAddModal}
          onSell={handleOpenSellModal}
        />
        <TransactionHistory transactions={transactions} />
      </motion.div>

      <AddTransactionModal
        isOpen={addModalInfo.isOpen}
        onClose={() => setAddModalInfo({ isOpen: false, ticker: null, price: null })}
        ticker={addModalInfo.ticker}
        currentPrice={addModalInfo.price}
      />

      <SellTransactionModal
        isOpen={!!sellModalHolding}
        onClose={() => setSellModalHolding(null)}
        holding={sellModalHolding}
      />
    </>
  );
}