// src/features/admin/components/admin-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Users, FileText, BarChart2 } from 'lucide-react';
import { AdminUsersTable } from './users/admin-users-table';
import { AdminLogsTable } from './logs/admin-logs-table';

/**
 * Componente de pestañas (tabs) para las diferentes secciones del panel de admin.
 * Incluye:
 * - Gestión de Usuarios (activa)
 * - Blogs (deshabilitada - próximamente)
 * - Logs del Sistema (activa)
 * - Estadísticas (deshabilitada - próximamente)
 * 
 * @remarks
 * Las pestañas deshabilitadas muestran un mensaje "Próximamente..."
 * 
 * @example
 * ```tsx
 * <AdminTabs />
 * ```
 */
export function AdminTabs() {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="users">
          <Users className="w-4 h-4 mr-2" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger value="blogs" disabled>
          <FileText className="w-4 h-4 mr-2" />
          Blogs
        </TabsTrigger>
        <TabsTrigger value="logs">
          <FileText className="w-4 h-4 mr-2" />
          Logs
        </TabsTrigger>
        <TabsTrigger value="stats" disabled>
          <BarChart2 className="w-4 h-4 mr-2" />
          Estadísticas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <AdminUsersTable />
      </TabsContent>

      <TabsContent value="blogs" className="mt-6">
        <div className="text-center text-muted-foreground">
          Próximamente...
        </div>
      </TabsContent>

      <TabsContent value="logs" className="mt-6">
        <AdminLogsTable />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <div className="text-center text-muted-foreground">
          Próximamente...
        </div>
      </TabsContent>
    </Tabs>
  );
}
