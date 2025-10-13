// src/features/admin/components/admin-header.tsx

import { Shield } from 'lucide-react';

/**
 * Props para el componente AdminHeader.
 * @property title - Título principal del header
 * @property description - Descripción o subtítulo
 */
interface AdminHeaderProps {
  title: string;
  description: string;
}

/**
 * Header del panel de administración con icono de shield y textos.
 * Proporciona una identificación visual consistente para el área de admin.
 * 
 * @example
 * ```tsx
 * <AdminHeader
 *   title="Panel de Administración"
 *   description="Gestiona usuarios y contenido"
 * />
 * ```
 */
export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <div className="flex items-center gap-4 pb-4 mb-6 border-b">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 className="heading-2 font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
