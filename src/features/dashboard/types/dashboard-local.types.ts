// src/features/dashboard/types/dashboard-local.types.ts

/**
 * Tipos locales específicos del feature dashboard.
 * Los tipos principales (AssetData) están en src/types/dashboard.ts
 */

import type { AssetData } from '../../../types/dashboard';

/**
 * Props para el componente TickerAddForm.
 */
export interface TickerAddFormProps {
  onAddTicker: (ticker: string) => void;
}

/**
 * Props para el componente SelectedTickersList.
 */
export interface SelectedTickersListProps {
  tickers: string[];
  onRemoveTicker: (ticker: string) => void;
}

/**
 * Props para el componente DashboardTabs.
 */
export interface DashboardTabsProps {
  assets: AssetData[];
  isLoading: boolean;
}

/**
 * Props para componentes que reciben lista de activos.
 */
export interface AssetsListProps {
  assets: AssetData[];
}

/**
 * Props para el estado vacío del dashboard.
 */
export interface EmptyDashboardProps {
  message?: string;
  description?: string;
}
