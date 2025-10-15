// src/features/asset-detail/pages/asset-detail-page.tsx

import { Link, useParams } from 'react-router-dom';
import { useAssetData } from '../../dashboard/hooks/use-asset-data';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  AssetDetailSkeleton,
  AssetHeader,
  AssetKeyMetrics,
  LoadingError,
  NotFoundError,
  DCFValuationCard,
  RatingScorecard,
  AssetDetailTabs,
} from '../components';

/**
 * Página de detalle de un activo financiero.
 * Muestra información completa del activo en tabs:
 * - Perfil: información general, ingresos por segmento
 * - Gráfico: rendimiento histórico
 * - Finanzas: métricas financieras detalladas
 * - Noticias: próximamente
 */
export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: asset, isLoading, isError, error } = useAssetData(symbol!);

  // Loading state
  if (isLoading) {
    return <AssetDetailSkeleton />;
  }

  // Error state
  if (isError) {
    return <LoadingError errorMessage={error.message} />;
  }

  // Not found state
  if (!asset) {
    return <NotFoundError symbol={symbol ?? 'UNKNOWN'} />;
  }

  // Main content
  return (
    <motion.div
      className="container-wide stack-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <Button variant="outline" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
      </Button>

      {/* Header */}
      <AssetHeader asset={asset} />

      {/* Key Metrics */}
      <AssetKeyMetrics asset={asset} />

      {/* Valuation & Rating Cards */}
      <div className="grid-cards-2">
        <DCFValuationCard currentPrice={asset.currentPrice} dcf={asset.dcf} />
        <RatingScorecard rating={asset.rating} />
      </div>

      {/* Tabs */}
      <AssetDetailTabs asset={asset} />
    </motion.div>
  );
}