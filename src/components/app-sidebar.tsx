// src/components/app-sidebar.tsx

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
  LogIn, // <--- Importar ícono
  UserPlus,
  User,
  Globe, // <--- Importar ícono
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useConfig } from "../hooks/use-config";
import { Skeleton } from "../components/ui/skeleton"; 
import { SidebarLink } from "../types/config";

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
  User,
  Globe
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile, user, signOut, isLoaded } = useAuth();
  const config = useConfig();

  const isLinkVisible = (link: SidebarLink) => {
    if (!link.requiresAuth) {
      return true;
    }
    if (link.requiresAuth && !user) {
      return false;
    }
    if (link.requiresRole && profile?.role.toLowerCase() !== link.requiresRole.toLowerCase()) {
      return false;
    }
    if (link.requiresPermission && !profile?.[link.requiresPermission]) {
      return false;
    }
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
          // --- Inicio del cambio ---
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink to="/login" className="w-full">
                <SidebarMenuButton tooltip="Iniciar Sesión" className="w-full">
                  <LogIn />
                  <span>Iniciar Sesión</span>
                </SidebarMenuButton>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink to="/register" className="w-full">
                <SidebarMenuButton tooltip="Registrarse" variant="outline" className="w-full">
                  <UserPlus />
                  <span>Registrarse</span>
                </SidebarMenuButton>
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
          // --- Fin del cambio ---
        )}
      </SidebarFooter>
    </Sidebar>
  );
}