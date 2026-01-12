// src/features/dashboard/components/empty-state/empty-dashboard.tsx

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

interface EmptyDashboardProps {
  message?: string;
  description?: string;
}

export function EmptyDashboard({
  message = 'Tu dashboard está vacío',
  description = 'Comienza añadiendo un activo desde la barra de búsqueda superior.',
}: EmptyDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-xl bg-muted/5"
    >
      <div className="bg-muted/20 p-4 rounded-full mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">{message}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </motion.div>
  );
}