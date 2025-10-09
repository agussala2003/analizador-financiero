// src/App.tsx

import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Toaster } from "sonner";
import { ModeToggle } from "./components/mode-toggle";
import GenericBreadcrumb from "./components/breadcrumb-demo";
import ActivesBar from "./components/actives-bar";
import React from "react";

export default function App() {
  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* Sidebar y SidebarInset se encargan del layout */}
        <AppSidebar />
        <SidebarInset>
          {/* Barra superior fija */}
          <ActivesBar />
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <GenericBreadcrumb />
            </div>
            <ModeToggle />
          </header>

          {/* Área de contenido con scroll interno */}
          <main className="flex-1">
            <React.Suspense fallback={<div>Cargando...</div>}>
            <Outlet />
          </React.Suspense>
          </main>
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  );
}
