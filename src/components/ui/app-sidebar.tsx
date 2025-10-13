// src/components/app-sidebar.tsx

import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./sidebar";
import {
  Wallet, LogIn, UserPlus, Home, ChartCandlestick, LayoutDashboard,
  Divide, Newspaper, BookCopy, BookMarked, FilePenLine, FileEdit,
  MessageSquareHeart, Shield, User, Globe, PiggyBank, Star, Bookmark
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { useConfig } from "../../hooks/use-config";
import { Skeleton } from "./skeleton";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { isLinkVisible } from "../../utils/sidebar-visibility";
import { Config } from "../../types/config";
import { Profile } from "../../types/auth";
import { User as SupabaseUser } from "@supabase/supabase-js";

// --- Sub-componentes para mayor claridad ---

/**
 * Contenido de la cabecera de la barra lateral, mostrando el logo y nombre de la app.
 */
const SidebarHeaderContent = React.memo(({ config }: { config: Config }) => (
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <NavLink to="/" className="flex items-center gap-2">
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Wallet className="size-5" />
            </div>
            <div className="grid flex-1 text-left body-sm leading-tight">
              <span className="truncate font-medium">{config.app.name}</span>
              <span className="text-muted-foreground truncate caption">{config.app.version}</span>
            </div>
          </SidebarMenuButton>
        </NavLink>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
));
SidebarHeaderContent.displayName = "SidebarHeaderContent";

/**
 * Contenido principal de navegación, renderiza los grupos de enlaces.
 * Muestra esqueletos de carga mientras se obtiene la sesión del usuario.
 */
const SidebarNavigation = React.memo(({ isLoaded, config, user, profile }: { isLoaded: boolean; config: Config; user: SupabaseUser | null; profile: Profile | null }) => {
  const iconMap = {
    Home, ChartCandlestick, LayoutDashboard, Divide, Newspaper, BookCopy,
    BookMarked, FilePenLine, FileEdit, Bookmark, MessageSquareHeart, Shield, User, Globe, PiggyBank, Star
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <>
      {config.sidebar.groups.map((group) => {
        const visibleItems = group.items
          .filter(link => isLinkVisible(link, user, profile))
          .map((link) => ({
            ...link,
            title: link.label,
            url: link.to,
            icon: iconMap[link.icon as keyof typeof iconMap] as React.ComponentType<unknown> | undefined,
          }));

        return visibleItems.length > 0 ? (
          <NavMain key={group.label} label={group.label} items={visibleItems} />
        ) : null;
      })}
    </>
  );
});
SidebarNavigation.displayName = "SidebarNavigation";

/**
 * Contenido del pie de la barra lateral.
 * Muestra el perfil del usuario si está logueado, o los botones de login/registro si no lo está.
 */
const SidebarFooterContent = React.memo(({ isLoaded, user, profile, signOut }: ReturnType<typeof useAuth>) => {
  if (!isLoaded) {
    return (
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (user && profile) {
    return <NavUser user={user} signOut={() => void signOut()} profile={profile} />;
  }

  return (
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
  );
});
SidebarFooterContent.displayName = "SidebarFooterContent";

/**
 * Componente principal de la barra lateral de la aplicación.
 * Orquesta la cabecera, el contenido de navegación y el pie de página.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth();
  const config = useConfig();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderContent config={config} />
      <SidebarContent>
        <SidebarNavigation {...auth} config={config} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterContent {...auth} />
      </SidebarFooter>
    </Sidebar>
  );
}