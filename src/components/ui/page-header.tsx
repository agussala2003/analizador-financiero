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
 */
export function PageHeader({ icon, title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 pb-4 mb-6 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}