// src/features/asset-detail/components/asset-detail-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { AssetProfileTab } from './profile/asset-profile-tab';
import { AssetFinancialsTab } from './financials/asset-financials-tab';
import type { AssetData } from '../../../types/dashboard';

/**
 * Props para el componente AssetDetailTabs.
 * @property asset - Datos completos del activo
 */
interface AssetDetailTabsProps {
  asset: AssetData;
}

/**
 * Componente de navegación por tabs para los detalles del activo.
 * Incluye dos tabs: Perfil (información general) y Métricas Financieras.
 * 
 * @example
 * ```tsx
 * <AssetDetailTabs asset={assetData} />
 * ```
 */
export function AssetDetailTabs({ asset }: AssetDetailTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="financials">Métricas Financieras</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <AssetProfileTab asset={asset} />
      </TabsContent>

      <TabsContent value="financials">
        <AssetFinancialsTab asset={asset} />
      </TabsContent>
    </Tabs>
  );
}
