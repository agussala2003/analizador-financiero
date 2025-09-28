import { NavLink } from "react-router-dom";
import { NavMain } from "../components/nav-main";
import { NavUser } from "../components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../components/ui/sidebar";
import {
  LayoutDashboard,
  Wallet,
  Newspaper,
  BookMarked,
  FilePenLine,
  MessageSquareHeart,
  Shield,
  BookCopy,
  Home,
  ChartCandlestick,
  Divide,
  LucideProps,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { useConfig } from "../hooks/use-config";
import { Skeleton } from "../components/ui/skeleton"; // Importa un componente Skeleton
import { SidebarLink } from "../types/config";

// 1. Mapa de Íconos para convertir strings a componentes
const iconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  Home,
  ChartCandlestick,
  LayoutDashboard,
  Divide,
  Newspaper,
  BookCopy,
  BookMarked,
  FilePenLine,
  MessageSquareHeart,
  Shield,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 2. Obtén el estado de carga de tu hook de autenticación
  const { profile, user, signOut, isLoaded } = useAuth();
  const config = useConfig();

  // 3. Lógica centralizada para determinar la visibilidad de un enlace
  const isLinkVisible = (link: SidebarLink) => {
    // Si no requiere autenticación, siempre es visible
    if (!link.requiresAuth) {
      return true;
    }
    // Si requiere autenticación pero no hay usuario, no es visible
    if (link.requiresAuth && !user) {
      return false;
    }
    // Si requiere un rol, verifica que el perfil del usuario lo tenga
    if (link.requiresRole && profile?.role.toLowerCase() !== link.requiresRole.toLowerCase()) {
      return false;
    }
    // Si requiere un permiso, verifica que el perfil lo tenga en true
    if (link.requiresPermission && !profile?.[link.requiresPermission]) {
      return false;
    }
    // Si pasó todas las validaciones, es visible
    return true;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to="/" className="flex items-center gap-2">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Wallet className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{config.app.name}</span>
                  <span className="truncate text-xs">{config.app.version}</span>
                </div>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!isLoaded ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          config.sidebar.groups.map((group) => {
            const visibleItems = group.items
              .filter(isLinkVisible)
              .map((link) => ({
                ...link,
                title: link.label,
                url: link.to,
                icon: iconMap[link.icon] || Home,
              }));

            return visibleItems.length > 0 ? (
              <NavMain key={group.label} label={group.label} items={visibleItems} />
            ) : null;
          })
        )}
      </SidebarContent>

      <SidebarFooter>
        {!isLoaded ? (
          <div className="p-4">
            <Skeleton className="h-10 w-full" />
          </div>
        ) : user && profile ? (
          <NavUser user={user} signOut={signOut} profile={profile} />
        ) : (
          <div className="flex flex-col gap-2">
            <NavLink to="/login" className="w-full">
              <Button variant="default" className="w-full">
                Iniciar Sesión
              </Button>
            </NavLink>
            <NavLink to="/register" className="w-full">
              <Button variant="outline" className="w-full">
                Registrarse
              </Button>
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}