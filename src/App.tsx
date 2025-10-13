// src/App.tsx

import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/ui/app-sidebar";
import { Toaster } from "sonner";
import { ModeToggle } from "./components/ui/mode-toggle";
import GenericBreadcrumb from "./components/ui/breadcrumb-demo";
import ActivesBar from "./components/ui/actives-bar";
import { CommandMenu } from "./components/search/command-menu";
import { ErrorBoundary } from "./components/error-boundary";
import { SuspenseFallback } from "./components/suspense";
import React from "react";

export default function App() {
  return (
    <ErrorBoundary level="root">
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
            <div className="flex items-center gap-2">
              <CommandMenu />
              <ModeToggle />
            </div>
          </header>

          {/* Área de contenido con scroll interno */}
          <main className="flex-1">
            <React.Suspense fallback={<SuspenseFallback type="page" message="Cargando página..." />}>
              <Outlet />
            </React.Suspense>
          </main>
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
    </ErrorBoundary>
  );
}
