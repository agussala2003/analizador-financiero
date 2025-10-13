// src/features/admin/components/admin-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Users, FileText, BarChart2, BookCopy } from 'lucide-react';
import { AdminUsersTable } from './users/admin-users-table';
import { AdminLogsTable } from './logs/admin-logs-table';
import { AdminBlogsSection } from './blogs/admin-blogs-section';
import { AdminStatsSection } from './stats/admin-stats-section';

/**
 * Componente de pestañas (tabs) para las diferentes secciones del panel de admin.
 * Incluye:
 * - Gestión de Usuarios
 * - Gestión de Blogs
 * - Logs del Sistema
 * - Estadísticas Completas (usuarios, blogs, portfolio, watchlist, sugerencias, logs)
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
        <TabsTrigger value="blogs">
          <BookCopy className="w-4 h-4 mr-2" />
          Blogs
        </TabsTrigger>
        <TabsTrigger value="logs">
          <FileText className="w-4 h-4 mr-2" />
          Logs
        </TabsTrigger>
        <TabsTrigger value="stats">
          <BarChart2 className="w-4 h-4 mr-2" />
          Estadísticas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <AdminUsersTable />
      </TabsContent>

      <TabsContent value="blogs" className="mt-6">
        <AdminBlogsSection />
      </TabsContent>

      <TabsContent value="logs" className="mt-6">
        <AdminLogsTable />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <AdminStatsSection />
      </TabsContent>
    </Tabs>
  );
}
