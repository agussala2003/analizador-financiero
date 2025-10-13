// src/features/dashboard/components/empty-state/empty-dashboard.tsx

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

/**
 * Props para el componente EmptyDashboard.
 * @property message - Mensaje principal opcional
 * @property description - Descripción opcional
 */
interface EmptyDashboardProps {
  message?: string;
  description?: string;
}

/**
 * Componente que muestra el estado vacío del dashboard.
 * Se muestra cuando no hay tickers seleccionados.
 * 
 * Incluye:
 * - Icono de briefcase
 * - Mensaje personalizable
 * - Descripción personalizable
 * - Animación de entrada
 * 
 * @example
 * ```tsx
 * <EmptyDashboard />
 * <EmptyDashboard 
 *   message="Personalizado"
 *   description="Agrega activos para comenzar"
 * />
 * ```
 */
export function EmptyDashboard({
  message = 'Tu dashboard está vacío',
  description = 'Comienza añadiendo un activo desde la barra de búsqueda superior.',
}: EmptyDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20 px-6 border-2 border-dashed rounded-lg"
    >
      <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">{message}</h2>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

