// src/features/admin/pages/admin-page.tsx

import { AdminHeader } from '../components/admin-header';
import { AdminTabs } from '../components/admin-tabs';

/**
 * Página principal del panel de administración.
 * Punto de entrada para la gestión de usuarios, logs y estadísticas del sistema.
 * 
 * Esta página actúa como un orquestador que compone:
 * - Header con título e icono
 * - Sistema de tabs para navegar entre secciones
 * 
 * @remarks
 * - Solo accesible para usuarios con rol 'administrador'
 * - Protegida por `<AdminRoute>` en main.tsx
 * - Algunas secciones están deshabilitadas (Blogs, Estadísticas)
 * 
 * @example
 * Uso en routing:
 * ```tsx
 * <Route path="admin" element={<AdminPage />} />
 * ```
 */
export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <AdminHeader
        title="Panel de Administración"
        description="Gestiona usuarios, contenido y estadísticas de la aplicación."
      />
      
      <AdminTabs />
    </div>
  );
}