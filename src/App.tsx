// src/App.tsx

import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Toaster } from "sonner";
import { ModeToggle } from "./components/mode-toggle";
import GenericBreadcrumb from "./components/breadcrumb-demo";
import ActivesBar from "./components/actives-bar"; // Se mantiene la importación

function App() {
  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* Se elimina el padding-top del div principal */}
        <div className="flex w-full">
          <AppSidebar />
          <SidebarInset>
            <ActivesBar  />
            
            <div className="flex justify-between p-4">
              <div className="flex items-center justify-end gap-6">
                <SidebarTrigger />
                <GenericBreadcrumb />
              </div>
              <ModeToggle />
            </div>
            <Outlet />
          </SidebarInset>
        </div>
      </ThemeProvider>
    </SidebarProvider>
  )
}

export default App;