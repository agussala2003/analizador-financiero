// src/features/asset-detail/components/profile/company-info-item.tsx

import React from 'react';

/**
 * Props para el componente CompanyInfoItem.
 * @property icon - Icono de lucide-react a mostrar
 * @property label - Etiqueta descriptiva del campo
 * @property value - Valor a mostrar (puede ser string o JSX para links)
 */
interface CompanyInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

/**
 * Componente reutilizable para mostrar un campo de información de la compañía.
 * Incluye un icono, etiqueta y valor con diseño consistente.
 * 
 * Usado en el tab de perfil para mostrar sector, industria, CEO, etc.
 * 
 * @example
 * ```tsx
 * <CompanyInfoItem
 *   icon={<Building className="w-5 h-5" />}
 *   label="Industria"
 *   value="Technology"
 * />
 * 
 * <CompanyInfoItem
 *   icon={<Globe className="w-5 h-5" />}
 *   label="Website"
 *   value={<a href="...">example.com</a>}
 * />
 * ```
 */
export function CompanyInfoItem({ icon, label, value }: CompanyInfoItemProps) {
  if (!value || value === 'N/A' || value === 'Unknown') return null;

  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="text-primary mt-0.5 flex-shrink-0 scale-90 sm:scale-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="text-sm sm:text-base font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
