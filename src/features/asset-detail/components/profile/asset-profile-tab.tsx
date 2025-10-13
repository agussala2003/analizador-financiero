// src/features/asset-detail/components/profile/asset-profile-tab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Briefcase,
  Building,
  ExternalLink,
  Globe,
  UserCircle,
  Users,
} from 'lucide-react';
import { CompanyInfoItem } from './company-info-item';
import { RevenueSegmentationCharts } from './revenue-segmentation-charts';
import { formatLargeNumber } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';

/**
 * Props para el componente AssetProfileTab.
 * @property asset - Datos completos del activo
 */
interface AssetProfileTabProps {
  asset: AssetData;
}

/**
 * Tab de perfil del activo que muestra información general de la compañía.
 * Incluye descripción, información corporativa y segmentación de ingresos.
 * 
 * Renderiza:
 * - Descripción de la empresa
 * - Sector, industria, CEO, empleados, país, website
 * - Gráficos de segmentación de ingresos (geográfica y por producto)
 * 
 * @example
 * ```tsx
 * <AssetProfileTab asset={assetData} />
 * ```
 */
export function AssetProfileTab({ asset }: AssetProfileTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Acerca de {asset.companyName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="body leading-relaxed text-muted-foreground">
            {asset.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <CompanyInfoItem
              icon={<Briefcase className="w-5 h-5" />}
              label="Sector"
              value={asset.sector ?? 'N/A'}
            />
            <CompanyInfoItem
              icon={<Building className="w-5 h-5" />}
              label="Industria"
              value={asset.industry ?? 'N/A'}
            />
            <CompanyInfoItem
              icon={<UserCircle className="w-5 h-5" />}
              label="CEO"
              value={asset.ceo ?? 'N/A'}
            />
            <CompanyInfoItem
              icon={<Users className="w-5 h-5" />}
              label="Empleados"
              value={
                typeof asset.employees === 'number'
                  ? formatLargeNumber(asset.employees)
                  : 'N/A'
              }
            />
            <CompanyInfoItem
              icon={<Globe className="w-5 h-5" />}
              label="País"
              value={asset.country ?? 'N/A'}
            />
            <CompanyInfoItem
              icon={<ExternalLink className="w-5 h-5" />}
              label="Sitio Web"
              value={
                asset.website ? (
                  <a
                    href={asset.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block max-w-full"
                  >
                    {asset.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  'N/A'
                )
              }
            />
          </div>
        </CardContent>
      </Card>
      <RevenueSegmentationCharts asset={asset} />
    </>
  );
}
