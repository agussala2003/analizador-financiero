// src/features/asset-detail/components/header/asset-header.tsx

import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatPrice, formatPercentage } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';
import { WatchlistToggleButton } from '../../../watchlist/components/watchlist-toggle-button';

/**
 * Props para el componente AssetHeader.
 * @property asset - Datos del activo
 */
interface AssetHeaderProps {
  asset: AssetData;
}

/**
 * Componente que muestra el encabezado del detalle del activo.
 * Incluye logo, nombre, símbolo, bolsa, precio actual y cambio del día.
 * 
 * @example
 * ```tsx
 * <AssetHeader asset={assetData} />
 * ```
 */
export function AssetHeader({ asset }: AssetHeaderProps) {
  const isPositiveChange = asset.dayChange >= 0;
  const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <img
        src={asset.image}
        alt={asset.companyName}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border object-contain bg-background shadow-sm"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = '/placeholder.svg';
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="heading-1 truncate">
              {asset.companyName} ({asset.symbol})
            </h1>
            <p className="heading-4 text-muted-foreground">
              {asset.exchangeFullName}
            </p>
          </div>
          <WatchlistToggleButton symbol={asset.symbol} variant="outline" />
        </div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="heading-1 font-bold">
            {formatPrice(asset.currentPrice)}
          </span>
          <span className={`flex items-center gap-1 heading-4 font-semibold ${changeColor}`}>
            {isPositiveChange ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {formatPercentage(Math.abs(asset.dayChange))}
          </span>
        </div>
      </div>
    </div>
  );
}
