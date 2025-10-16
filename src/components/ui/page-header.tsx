// src/components/ui/page-header.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Componente reutilizable para las cabeceras de las páginas principales.
 * Incluye un ícono, título y descripción con una animación de entrada.
 * 
 * @remarks
 * - Usa `heading-2` para el título (responsive: text-3xl lg:text-4xl)
 * - Usa `body` para la descripción con color muted
 * - Usa `section-divider` para separación consistente
 * - Animación optimizada (0.3s)
 */
export function PageHeader({ icon, title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}