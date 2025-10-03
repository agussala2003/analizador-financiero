import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Shield, Users, FileText, BarChart2 } from "lucide-react";
import { AdminUsersPage } from "../users/admin-users";
import { AdminLogsPage } from "../users/admin-logs";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4 pb-4 mb-6 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, contenido y estadísticas de la aplicación.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="blogs" disabled><FileText className="w-4 h-4 mr-2" />Blogs</TabsTrigger>
          <TabsTrigger value="logs"><FileText className="w-4 h-4 mr-2" />Logs</TabsTrigger>
          <TabsTrigger value="stats" disabled><BarChart2 className="w-4 h-4 mr-2" />Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <AdminUsersPage />
        </TabsContent>
        <TabsContent value="blogs" className="mt-6">
          <div className="text-center text-muted-foreground">Próximamente...</div>
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <AdminLogsPage />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <div className="text-center text-muted-foreground">Próximamente...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}