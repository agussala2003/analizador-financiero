// src/features/asset-detail/components/asset-detail-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { AssetProfileTab } from './profile/asset-profile-tab';
import { AssetFinancialsTab } from './financials/asset-financials-tab';
import { motion } from 'framer-motion';
import type { AssetData } from '../../../types/dashboard';
import { BarChart3, Building2, DollarSign, Info, Newspaper } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { HistoricalPerformanceChart } from '../../dashboard/components';
import { AssetGradesTab } from './ratings/asset-grades-tab';

/**
 * Props para el componente AssetDetailTabs.
 * @property asset - Datos completos del activo
 */
interface AssetDetailTabsProps {
  asset: AssetData;
}

/**
 * Componente de navegación por tabs para los detalles del activo.
 * Incluye tres tabs: Perfil, Métricas Financieras y Calificaciones.
 * 
 * @example
 * ```tsx
 * <AssetDetailTabs asset={assetData} />
 * ```
 */
export function AssetDetailTabs({ asset }: AssetDetailTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Info className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Gráfico
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Finanzas
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Noticias
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Calificaciones de analistas
          </TabsTrigger>
        </TabsList>

        <motion.div
          key="tabs-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="profile" className="mt-6">
            <AssetProfileTab asset={asset} />
          </TabsContent>

          <TabsContent value="chart" className="mt-6">
            <Card className="p-4">
              <HistoricalPerformanceChart assets={[asset]} />
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <AssetFinancialsTab asset={asset} />
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <Newspaper className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Próximamente: Noticias del activo
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="mt-6">
            <AssetGradesTab symbol={asset.symbol} />
          </TabsContent>
        </motion.div>
      </Tabs>
  );
}
