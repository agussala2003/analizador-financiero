// src/features/portfolio/pages/portfolio-page.tsx

import { useState, useMemo } from 'react';
import { usePortfolio } from '../../../hooks/use-portfolio';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../../components/ui/theme-provider';
import { exportPortfolioToPdf } from '../../../utils/export-pdf';
import { Button } from '../../../components/ui/button';
import { usePlanFeature } from '../../../hooks/use-plan-feature';
import { UpgradeModal } from '../../../components/shared/upgrade-modal';
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
  const { theme } = useTheme();
  const { hasAccess: canExportPdf, requiredPlan } = usePlanFeature('exportPdf');

  const [addModalInfo, setAddModalInfo] = useState<AddModalInfo>({
    isOpen: false,
    ticker: null,
    price: null,
  });
  const [sellModalHolding, setSellModalHolding] = useState<HoldingWithMetrics | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const handleExportPdf = async () => {
    // Verificar acceso a la funcionalidad
    if (!canExportPdf) {
      setShowUpgradeModal(true);
      return;
    }

    if (holdingsWithMetrics.length === 0) {
      toast.error('No hay posiciones para exportar.');
      return;
    }

    setExportingPdf(true);
    try {
      // Calcular estadísticas para el PDF
      const totalInvestment = holdings.reduce((sum, h) => sum + h.totalCost, 0);
      const currentValue = holdingsWithMetrics.reduce((sum, h) => sum + h.marketValue, 0);
      const totalGainLoss = totalPerformance.pl;
      const totalGainLossPercentage = totalPerformance.percent;
      const totalQuantity = holdings.reduce((sum, h) => sum + h.quantity, 0);
      const averageBuyPrice = totalQuantity > 0 ? totalInvestment / totalQuantity : 0;

      await exportPortfolioToPdf({
        holdings: holdingsWithMetrics.map((h) => ({
          symbol: h.symbol,
          quantity: h.quantity,
          averagePrice: h.avgPurchasePrice,
          currentPrice: h.currentPrice,
          totalCost: h.totalCost,
          currentValue: h.marketValue,
          gainLoss: h.pl,
          gainLossPercentage: h.plPercent,
        })),
        stats: {
          totalInvestment,
          currentValue,
          totalGainLoss,
          totalGainLossPercentage,
          averageBuyPrice,
        },
        theme: theme,
        portfolioName: 'Mi Portafolio',
      });
      toast.success('Portafolio exportado correctamente.');
    } catch (error) {
      toast.error('Error al exportar el portafolio.');
      console.error(error);
    } finally {
      setExportingPdf(false);
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
      
      // Calcular días de tenencia desde la primera compra
      const buyTransactions = transactions.filter(t => t.symbol === h.symbol && t.transaction_type === 'buy');
      const firstPurchaseDate = buyTransactions.length > 0 
        ? new Date(Math.min(...buyTransactions.map(t => new Date(t.purchase_date).getTime())))
        : new Date();
      const holdingDays = Math.floor((Date.now() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return { ...h, currentPrice, marketValue, pl, plPercent, holdingDays };
    });
  }, [holdings, portfolioData, loading, transactions]);

  // Calcular promedio de días de tenencia
  const avgHoldingDays = useMemo(() => {
    if (holdingsWithMetrics.length === 0) return 0;
    const totalDays = holdingsWithMetrics.reduce((sum, h) => sum + h.holdingDays, 0);
    return totalDays / holdingsWithMetrics.length;
  }, [holdingsWithMetrics]);

  if (loading) return <PortfolioSkeleton />;

  return (
    <>
      <motion.div
        className="container-wide stack-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-4 sm:mb-6 border-b flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Mi Portafolio</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Un resumen de tus inversiones, rendimiento y distribución.</p>
            </div>
          </div>
          <Button
            onClick={() => { void handleExportPdf(); }}
            disabled={exportingPdf || holdingsWithMetrics.length === 0}
            variant="outline"
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {exportingPdf ? 'Exportando...' : 'Exportar a PDF'}
          </Button>
        </div>

        <PortfolioStats
          holdings={holdings}
          totalPerformance={totalPerformance}
          portfolioData={portfolioData}
          avgHoldingDays={avgHoldingDays}
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Exportar Portfolio a PDF"
        requiredPlan={requiredPlan}
        description="Exporta tu portfolio completo con estadísticas detalladas y gráficos en formato PDF profesional."
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