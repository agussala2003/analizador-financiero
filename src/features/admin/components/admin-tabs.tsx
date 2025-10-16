// src/features/admin/components/admin-tabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card } from '../../../components/ui/card';
import { Users, FileText, BarChart2, BookCopy, Info, Lightbulb, Mail } from 'lucide-react';
import { AdminUsersTable } from './users/admin-users-table';
import { AdminLogsTable } from './logs/admin-logs-table';
import { AdminBlogsSection } from './blogs/admin-blogs-section';
import { AdminStatsSection } from './stats/admin-stats-section';
import { AdminSuggestionsSection } from './suggestions/admin-suggestions-section';
import { AdminContactMessagesSection } from './contact/admin-contact-messages-section';

/**
 * Tarjeta de ayuda contextual para cada pestaña
 */
function TabHelper({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-2 sm:gap-3">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
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
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-1">
        <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Usuarios</span>
          <span className="sm:hidden">👥</span>
        </TabsTrigger>
        <TabsTrigger value="blogs" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <BookCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Blogs</span>
          <span className="sm:hidden">📝</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Contacto</span>
          <span className="sm:hidden">📧</span>
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Sugerencias</span>
          <span className="sm:hidden">💡</span>
        </TabsTrigger>
        <TabsTrigger value="logs" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Logs</span>
          <span className="sm:hidden">📋</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2.5">
          <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Estadísticas</span>
          <span className="sm:hidden">📊</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Gestión de Usuarios"
          description="Administra los usuarios de la plataforma. Puedes editar roles, otorgar permisos de blog, y ver información detallada de cada usuario. Los cambios se guardan automáticamente."
        />
        <AdminUsersTable />
      </TabsContent>

      <TabsContent value="blogs" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Moderación de Blogs"
          description="Revisa y modera artículos de blog enviados por los usuarios. Aprueba, rechaza o solicita cambios en las publicaciones pendientes. Los autores serán notificados de las decisiones."
        />
        <AdminBlogsSection />
      </TabsContent>

      <TabsContent value="contact" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Mensajes de Contacto"
          description="Administra los mensajes recibidos a través del formulario de contacto. Revisa consultas, marca como leído o respondido, y contacta directamente a los usuarios por email."
        />
        <AdminContactMessagesSection />
      </TabsContent>

      <TabsContent value="suggestions" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Gestión de Sugerencias"
          description="Administra las sugerencias enviadas por los usuarios. Revisa, aprueba o rechaza ideas para mejorar la plataforma. Puedes cambiar el estado y eliminar sugerencias."
        />
        <AdminSuggestionsSection />
      </TabsContent>

      <TabsContent value="logs" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Registro de Actividad"
          description="Monitorea todos los eventos del sistema incluyendo autenticación, errores, y acciones de usuarios. Útil para debugging y auditoría de seguridad."
        />
        <AdminLogsTable />
      </TabsContent>

      <TabsContent value="stats" className="mt-4 sm:mt-6">
        <TabHelper 
          title="Estadísticas del Sistema"
          description="Vista general de métricas clave de la plataforma. Incluye usuarios activos, blogs publicados, transacciones de portfolio, y más. Filtra por período para análisis detallados."
        />
        <AdminStatsSection />
      </TabsContent>
    </Tabs>
  );
}
