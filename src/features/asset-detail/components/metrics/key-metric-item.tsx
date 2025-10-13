// src/features/asset-detail/components/metrics/key-metric-item.tsx

import React from 'react';

/**
 * Props para el componente KeyMetricItem.
 * @property label - Etiqueta descriptiva de la métrica
 * @property value - Valor a mostrar (puede ser string o número formateado)
 */
interface KeyMetricItemProps {
  label: string;
  value: React.ReactNode;
}

/**
 * Componente individual para mostrar una métrica clave.
 * Layout responsive: centrado en móvil, alineado a la izquierda en desktop.
 * 
 * @example
 * ```tsx
 * <KeyMetricItem label="Market Cap" value="$2.5T" />
 * <KeyMetricItem label="Beta" value="1.25" />
 * ```
 */
export function KeyMetricItem({ label, value }: KeyMetricItemProps) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
      <p className="caption text-muted-foreground font-medium">{label}</p>
      <p className="body font-bold text-foreground min-h-6 flex items-center justify-center sm:justify-start">
        {value}
      </p>
    </div>
  );
}
