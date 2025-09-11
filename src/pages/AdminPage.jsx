// src/pages/AdminPage.jsx (o donde lo tengas)
// Reemplazo completo
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { useState } from "react";
import AdminUsersModule from "../components/admin/AdminUsersModule";
import AdminSuggestionsModule from "../components/admin/AdminSuggestionModule";
import AdminLogsModule from "../components/admin/AdminLogsModule";
import AdminStatsModule from "../components/admin/AdminStatsModule";
import AdminBlogsModule from "../components/admin/AdminBlogsModule";
import { TourButton } from "../components/onboarding/TooltipSystem";

function getNavButtonClass(active, viewName) {
  const isActive = active === viewName;
  return [
    "whitespace-nowrap cursor-pointer",
    "py-2 px-3 sm:px-4",
    "rounded-t-lg",
    "text-sm sm:text-[0.95rem] font-medium",
    "transition-colors",
    isActive
      ? "bg-gray-700 text-white border-b-2 border-blue-500"
      : "text-gray-300 hover:bg-gray-800",
  ].join(" ");
}

const adminPageTourSteps = [
  {
    selector: '[data-tour="admin-tabs"]',
    title: '1. Módulos de Gestión',
    description: 'Navega entre los distintos paneles de administración, como Usuarios, Blogs, Sugerencias, Logs y Estadísticas.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-users-tab"]',
    title: '2. Gestión de Usuarios',
    description: 'Administra los usuarios registrados, sus roles y permisos.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-blogs-tab"]',
    title: '3. Gestión de Blogs',
    description: 'Administra los blogs de la aplicación, incluyendo la creación, edición y eliminación de entradas.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-suggestions-tab"]',
    title: '4. Gestión de Sugerencias',
    description: 'Administra las sugerencias de los usuarios, incluyendo la revisión y aprobación de las mismas.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-logs-tab"]',
    title: '5. Gestión de Logs',
    description: 'Visualiza y gestiona los logs del sistema, incluyendo errores y eventos importantes.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-stats-tab"]',
    title: '6. Estadísticas',
    description: 'Visualiza y analiza las estadísticas de uso de la aplicación.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="admin-content"]',
    title: '7. Contenido del Módulo',
    description: 'El área principal donde se muestra el contenido del módulo seleccionado.',
    placement: 'top'
  },
  {
    selector: '[data-tour="admin-help"]',
    title: '8. Ayuda',
    description: 'Accede a esta guía en cualquier momento haciendo clic en el ícono de ayuda.',
    placement: 'left'
  }
];

export default function AdminLanding() {
  const [activeView, setActiveView] = useState("usuarios");

  return (
    <div aria-live="polite" className="pb-4">
      <Header />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mb-14">
        <div className="card bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
          <header className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
             <div>
               <h2 className="text-xl sm:text-2xl font-bold">Administrador</h2>
               <p className="text-xs sm:text-sm text-gray-300">Módulos de gestión</p>
             </div>
             <div className="hidden md:block" data-tour="admin-help">
               <TourButton className="md:cursor-pointer" tourSteps={adminPageTourSteps} />
             </div>
           </div>
          </header>

          {/* Tabs: hacen scroll horizontal en mobile */}
          <nav className="relative -mx-3 sm:mx-0">
            <div data-tour="admin-tabs" className="overflow-x-auto no-scrollbar px-3 sm:px-0">
              <div className="inline-flex min-w-full sm:min-w-0 border-b border-gray-600 gap-2 sm:gap-0">
                <button data-tour="admin-users-tab" onClick={() => setActiveView("usuarios")} className={getNavButtonClass(activeView, "usuarios")}>Usuarios</button>
                <button data-tour="admin-blogs-tab" onClick={() => setActiveView("blogs")} className={getNavButtonClass(activeView, "blogs")}>Blogs</button>
                <button data-tour="admin-suggestions-tab" onClick={() => setActiveView("sugerencias")} className={getNavButtonClass(activeView, "sugerencias")}>Sugerencias</button>
                <button data-tour="admin-logs-tab" onClick={() => setActiveView("logs")} className={getNavButtonClass(activeView, "logs")}>Logs</button>
                <button data-tour="admin-stats-tab" onClick={() => setActiveView("stats")} className={getNavButtonClass(activeView, "stats")}>Estadísticas</button>
              </div>
            </div>
          </nav>

          <main data-tour="admin-content" className="mt-4 sm:mt-6">
            {activeView === "usuarios" && <AdminUsersModule />}
            {activeView === "blogs" && <AdminBlogsModule />}
            {activeView === "sugerencias" && <AdminSuggestionsModule />}
            {activeView === "logs" && <AdminLogsModule />}
            {activeView === "stats" && <AdminStatsModule />}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
