// src/features/portfolio/pages/portfolio-page.tsx

import { useState, useMemo } from 'react';
import { usePortfolio } from '../../../hooks/use-portfolio';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { HoldingWithMetrics } from '../../../types/portfolio';
import { AddModalInfo } from '../types/portfolio.types';
import {
  PortfolioStats,
  PortfolioCharts,
  PortfolioView,
  TransactionHistory,
  AddTransactionModal,
  SellTransactionModal,
  PortfolioSkeleton,
} from '../components';
import { ErrorBoundary } from '../../../components/error-boundary';

function PortfolioPageContent() {
  const { holdings, transactions, totalPerformance, loading, deleteAsset, portfolioData } = usePortfolio();

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
        className="container-wide stack-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 section-divider">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="heading-2">Mi Portafolio</h1>
            <p className="body text-muted-foreground">Un resumen de tus inversiones, rendimiento y distribución.</p>
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

export default function PortfolioPage() {
  return (
    <ErrorBoundary level="feature" featureName="Portfolio">
      <PortfolioPageContent />
    </ErrorBoundary>
  );
}