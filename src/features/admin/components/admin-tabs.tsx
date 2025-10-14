// src/features/admin/components/admin-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card } from '../../../components/ui/card';
import { Users, FileText, BarChart2, BookCopy, Info, Lightbulb } from 'lucide-react';
import { AdminUsersTable } from './users/admin-users-table';
import { AdminLogsTable } from './logs/admin-logs-table';
import { AdminBlogsSection } from './blogs/admin-blogs-section';
import { AdminStatsSection } from './stats/admin-stats-section';
import { AdminSuggestionsSection } from './suggestions/admin-suggestions-section';

/**
 * Tarjeta de ayuda contextual para cada pestaña
 */
function TabHelper({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

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
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
        <TabsTrigger value="users">
          <Users className="w-4 h-4 mr-2" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger value="blogs">
          <BookCopy className="w-4 h-4 mr-2" />
          Blogs
        </TabsTrigger>
        <TabsTrigger value="suggestions">
          <Lightbulb className="w-4 h-4 mr-2" />
          Sugerencias
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
        <TabHelper 
          title="Gestión de Usuarios"
          description="Administra los usuarios de la plataforma. Puedes editar roles, otorgar permisos de blog, y ver información detallada de cada usuario. Los cambios se guardan automáticamente."
        />
        <AdminUsersTable />
      </TabsContent>

      <TabsContent value="blogs" className="mt-6">
        <TabHelper 
          title="Moderación de Blogs"
          description="Revisa y modera artículos de blog enviados por los usuarios. Aprueba, rechaza o solicita cambios en las publicaciones pendientes. Los autores serán notificados de las decisiones."
        />
        <AdminBlogsSection />
      </TabsContent>

      <TabsContent value="suggestions" className="mt-6">
        <TabHelper 
          title="Gestión de Sugerencias"
          description="Administra las sugerencias enviadas por los usuarios. Revisa, aprueba o rechaza ideas para mejorar la plataforma. Puedes cambiar el estado y eliminar sugerencias."
        />
        <AdminSuggestionsSection />
      </TabsContent>

      <TabsContent value="logs" className="mt-6">
        <TabHelper 
          title="Registro de Actividad"
          description="Monitorea todos los eventos del sistema incluyendo autenticación, errores, y acciones de usuarios. Útil para debugging y auditoría de seguridad."
        />
        <AdminLogsTable />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <TabHelper 
          title="Estadísticas del Sistema"
          description="Vista general de métricas clave de la plataforma. Incluye usuarios activos, blogs publicados, transacciones de portfolio, y más. Filtra por período para análisis detallados."
        />
        <AdminStatsSection />
      </TabsContent>
    </Tabs>
  );
}
