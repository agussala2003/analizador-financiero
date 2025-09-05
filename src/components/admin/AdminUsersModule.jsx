// src/components/admin/AdminUsersModule.jsx
// Reemplazo completo
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useError } from "../../context/ErrorContext";
import SkeletonRow from "../../components/ui/SkeletonRow";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const ROLES = [
  { value: "basico", label: "Básico" },
  { value: "plus", label: "Plus" },
  { value: "premium", label: "Premium" },
  { value: "administrador", label: "Administrador" },
];

function MobileUserCard({ p, onRoleChange }) {
  return (
    <article className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
      <div className="space-y-2">
        <div className="text-sm text-gray-400">Usuario</div>
        <div className="text-base font-medium text-white break-all">{p.email || "No disponible"}</div>

        <div className="text-sm text-gray-400 mt-3">Rol asignado</div>
        <select
          value={p.role || "basico"}
          onChange={(e) => onRoleChange(p.id, e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-500 mt-3">
          ID: <span className="break-all">{p.id}</span>
        </div>
      </div>
    </article>
  );
}

export default function AdminUsersModule() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { showError } = useError();

  const fetchPage = useCallback(
    async (p = page, ps = pageSize) => {
      setLoading(true);
      try {
        const from = (p - 1) * ps;
        const to = from + ps - 1;

        const base = supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .order("email", { ascending: true });

        const query = q ? base.ilike("email", `%${q}%`) : base;
        const { data, error, count } = await query.range(from, to);

        if (error) throw error;
        setProfiles(data ?? []);
        setTotal(count ?? 0);
      } catch (err) {
        showError("No se pudieron cargar los perfiles de usuario.", {
          title: "Error al Cargar Datos",
          detail: err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, q, showError]
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, pageSize);
  }, [pageSize, q, fetchPage]);

  useEffect(() => {
    fetchPage(page, pageSize);
  }, [page, fetchPage, pageSize]);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const handleRoleChange = async (profileId, newRole) => {
    const prevProfiles = [...profiles];
    setProfiles((curr) => curr.map((p) => (p.id === profileId ? { ...p, role: newRole } : p)));
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profileId);
      if (error) throw error;
      setFeedback({ message: "Rol actualizado con éxito.", type: "success" });
    } catch (err) {
      showError("No se pudo actualizar el rol del usuario.", {
        title: "Error de Actualización",
        detail: err.message,
      });
      setProfiles(prevProfiles);
    }
  };

  const resetApiCalls = async () => {
    try {
      const { error } = await supabase.from('profiles').update({ api_calls_made: 0 }).neq('role', 'administrador');
      if (error) throw error;
      setFeedback({ message: "Límite de llamadas API reseteado para todos los usuarios.", type: "success" });
      fetchPage(); // Refrescar la página actual
    } catch (err) {
      showError("No se pudo resetear el límite de llamadas API.", {
        title: "Error al Resetear Límite",
        detail: err.message,
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="animate-fade-in">
      {/* Filtros / acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h3 className="text-lg sm:text-xl font-semibold">Gestión de Usuarios</h3>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto lg:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email…"
            className="w-full sm:w-80 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 text-sm"
            title="Resultados por página"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}/pág.
              </option>
            ))}
          </select>
          {/* Boton para resetear las api_calls_made */}
          <button
            onClick={resetApiCalls}
            className="bg-red-600 text-white rounded-md px-4 py-2 text-sm"
          >
            Resetear Límite
          </button> 
        </div>
      </div>

      {feedback.message && (
        <div
          role="status"
          className={`p-3 rounded-md mb-4 text-sm ${
            feedback.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Mobile: cards | Desktop: tabla */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <article key={i} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 animate-pulse h-24" />
            ))
          : profiles.map((p) => (
              <MobileUserCard key={p.id} p={p} onRoleChange={handleRoleChange} />
            ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3">Usuario (Email)</th>
              <th className="px-4 py-3">Rol Asignado</th>
              <th className="px-4 py-3">ID de Usuario</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
              : profiles.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white break-all">
                      {p.email || "No disponible"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.role || "basico"}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-gray-600 border border-gray-500 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-300 break-all">{p.id}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm">
        <div className="text-gray-400">
          Página <span className="text-white">{page}</span> de{" "}
          <span className="text-white">{totalPages}</span>
          <span className="ms-2 text-gray-500">({total} en total)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}
