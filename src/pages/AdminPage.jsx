// src/pages/AdminPage.jsx (o donde lo tengas)
// Reemplazo completo
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { useState } from "react";
import AdminUsersModule from "../components/admin/AdminUsersModule";
import AdminSuggestionsModule from "../components/admin/AdminSuggestionModule";
import AdminLogsModule from "../components/admin/AdminLogsModule";
import AdminStatsModule from "../components/admin/AdminStatsModule";

function getNavButtonClass(active, viewName) {
  const isActive = active === viewName;
  return [
    "whitespace-nowrap",
    "py-2 px-3 sm:px-4",
    "rounded-t-lg",
    "text-sm sm:text-[0.95rem] font-medium",
    "transition-colors",
    isActive
      ? "bg-gray-700 text-white border-b-2 border-blue-500"
      : "text-gray-300 hover:bg-gray-800",
  ].join(" ");
}

export default function AdminLanding() {
  const [activeView, setActiveView] = useState("usuarios");

  return (
    <div aria-live="polite" className="pb-4">
      <Header />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mb-14">
        <div className="card bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
          <header className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Administrador</h2>
            <p className="text-xs sm:text-sm text-gray-300">Módulos de gestión</p>
          </header>

          {/* Tabs: hacen scroll horizontal en mobile */}
          <nav className="relative -mx-3 sm:mx-0">
            <div className="overflow-x-auto no-scrollbar px-3 sm:px-0">
              <div className="inline-flex min-w-full sm:min-w-0 border-b border-gray-600 gap-2 sm:gap-0">
                <button onClick={() => setActiveView("usuarios")} className={getNavButtonClass(activeView, "usuarios")}>Usuarios</button>
                <button onClick={() => setActiveView("sugerencias")} className={getNavButtonClass(activeView, "sugerencias")}>Sugerencias</button>
                <button onClick={() => setActiveView("logs")} className={getNavButtonClass(activeView, "logs")}>Logs</button>
                <button onClick={() => setActiveView("stats")} className={getNavButtonClass(activeView, "stats")}>Estadísticas</button>
              </div>
            </div>
          </nav>

          <main className="mt-4 sm:mt-6">
            {activeView === "usuarios" && <AdminUsersModule />}
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
