// src/components/admin/AdminUsersModule.jsx
// Reemplazo completo
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useError } from "../../hooks/useError";
import SkeletonRow from "../../components/ui/SkeletonRow";
import { useConfig } from "../../hooks/useConfig";
import { logger } from "../../lib/logger";

const ROLES = [
  { value: "basico", label: "Básico" },
  { value: "plus", label: "Plus" },
  { value: "premium", label: "Premium" },
  { value: "administrador", label: "Administrador" },
];

function MobileUserCard({ p, onRoleChange, onPermissionChange }) {
  return (
    <article className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-4">
      <div>
        <div className="text-sm text-gray-400">Usuario</div>
        <div className="text-base font-medium text-white break-all">{p.email || "No disponible"}</div>
      </div>

      <div>
        <div className="text-sm text-gray-400">Rol asignado</div>
        <select
          value={p.role || "basico"}
          onChange={(e) => onRoleChange(p.id, e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 mt-1"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">Puede Publicar Blogs</div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={p.can_upload_blog || false}
            onChange={() => onPermissionChange(p.id, p.can_upload_blog)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
        ID: <span className="break-all">{p.id}</span>
      </div>
    </article>
  );
}

export default function AdminUsersModule() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const config = useConfig();
  const PAGE_SIZE_OPTIONS = config.admin.pageSizeOptions;
  const { showError } = useError();

  // ✅ CORRECCIÓN: Se quita `page` y `pageSize` de las dependencias de useCallback.
  // La función ahora toma `p` y `ps` como argumentos explícitos.
  const fetchPage = useCallback(async (p, ps) => {
    setLoading(true);
    logger.info('ADMIN_USERS_FETCH_START', `Admin fetching users page ${p} with pageSize ${ps}`, { 
      page: p, 
      pageSize: ps, 
      searchQuery: q 
    });
    
    try {
      const from = (p - 1) * ps;
      const to = from + ps - 1;

      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("email", { ascending: true });

      if (q) {
        query = query.ilike("email", `%${q}%`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      logger.info('ADMIN_USERS_FETCH_SUCCESS', `Successfully fetched ${data?.length || 0} users`, { 
        page: p, 
        pageSize: ps, 
        totalUsers: count, 
        searchQuery: q 
      });
      setProfiles(data ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      logger.error('ADMIN_USERS_FETCH_FAILED', 'Failed to fetch users for admin', { 
        page: p, 
        pageSize: ps, 
        searchQuery: q, 
        errorMessage: err.message 
      });
      showError("No se pudieron cargar los perfiles de usuario.", { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [q, showError]); // ✅ Dependencias correctas

  // ✅ CORRECCIÓN: Lógica de efectos simplificada y corregida.
  // Este efecto se encarga de volver a la página 1 cuando cambia el filtro o el tamaño de página.
  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);
  
  // Este efecto se encarga de cargar los datos cada vez que la página, el filtro o el tamaño cambian.
  useEffect(() => {
    fetchPage(page, pageSize);
  }, [page, pageSize, fetchPage]); // fetchPage solo cambia cuando `q` cambia, lo cual es correcto.


  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  const handleRoleChange = async (profileId, newRole) => {
    const prevProfiles = [...profiles];
    const prevRole = profiles.find(p => p.id === profileId)?.role;
    setProfiles((curr) => curr.map((p) => (p.id === profileId ? { ...p, role: newRole } : p)));
    
    logger.info('ADMIN_USER_ROLE_CHANGE_START', `Admin changing user role from ${prevRole} to ${newRole}`, { 
      profileId, 
      previousRole: prevRole, 
      newRole 
    });
    
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profileId);
      if (error) throw error;
      
      logger.info('ADMIN_USER_ROLE_CHANGE_SUCCESS', `User role successfully changed to ${newRole}`, { 
        profileId, 
        previousRole: prevRole, 
        newRole 
      });
      setFeedback({ message: "Rol actualizado con éxito.", type: "success" });
    } catch (err) {
      logger.error('ADMIN_USER_ROLE_CHANGE_FAILED', 'Failed to update user role', { 
        profileId, 
        previousRole: prevRole, 
        newRole, 
        errorMessage: err.message 
      });
      showError("No se pudo actualizar el rol del usuario.", {
        title: "Error de Actualización",
        detail: err.message,
      });
      setProfiles(prevProfiles);
    }
  };

  const resetApiCalls = async () => {
    logger.info('ADMIN_API_RESET_START', 'Admin resetting API call limits for all users');
    
    try {
      const { error } = await supabase.from('profiles').update({ api_calls_made: 0 }).neq('role', 'administrador');
      if (error) throw error;
      
      logger.info('ADMIN_API_RESET_SUCCESS', 'API call limits successfully reset for all users');
      setFeedback({ message: "Límite de llamadas API reseteado para todos los usuarios.", type: "success" });
      fetchPage(); // Refrescar la página actual
    } catch (err) {
      logger.error('ADMIN_API_RESET_FAILED', 'Failed to reset API call limits', { errorMessage: err.message });
      showError("No se pudo resetear el límite de llamadas API.", {
        title: "Error al Resetear Límite",
        detail: err.message,
      });
    }
  };

  const handleCanUploadBlogChange = async (profileId, currentStatus) => {
      const newStatus = !currentStatus;
      const prevProfiles = [...profiles];
      setProfiles((curr) => curr.map((p) => (p.id === profileId ? { ...p, can_upload_blog: newStatus } : p)));
      
      logger.info('ADMIN_USER_BLOG_PERMISSION_CHANGE_START', `Admin changing blog permission from ${currentStatus} to ${newStatus}`, { 
        profileId, 
        previousPermission: currentStatus, 
        newPermission: newStatus 
      });
      
      try {
          const { error } = await supabase.from("profiles").update({ can_upload_blog: newStatus }).eq("id", profileId);
          if (error) throw error;
          
          logger.info('ADMIN_USER_BLOG_PERMISSION_CHANGE_SUCCESS', `Blog permission successfully changed to ${newStatus}`, { 
            profileId, 
            previousPermission: currentStatus, 
            newPermission: newStatus 
          });
          setFeedback({ message: "Permiso de blog actualizado.", type: "success" });
      } catch (err) {
          logger.error('ADMIN_USER_BLOG_PERMISSION_CHANGE_FAILED', 'Failed to update blog permission', { 
            profileId, 
            previousPermission: currentStatus, 
            newPermission: newStatus, 
            errorMessage: err.message 
          });
          showError("No se pudo actualizar el permiso de blog.", { detail: err.message });
          setProfiles(prevProfiles);
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
            className="w-full sm:w-80 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 text-sm"
            title="Resultados por página"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}/pág.</option>
            ))}
          </select>
          <button
            onClick={resetApiCalls}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-semibold"
          >
            Resetear Límite
          </button> 
        </div>
      </div>

      {feedback.message && (
        <div role="status" className={`p-3 rounded-md mb-4 text-sm ${feedback.type === "success" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
          {feedback.message}
        </div>
      )}

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <article key={i} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 animate-pulse h-48" />
            ))
          : profiles.map((p) => (
              <MobileUserCard key={p.id} p={p} onRoleChange={handleRoleChange} onPermissionChange={handleCanUploadBlogChange} />
            ))}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol Asignado</th>
              <th className="px-4 py-3 text-center">Puede Publicar Blogs</th>
              <th className="px-4 py-3">ID de Usuario</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} cols={4} />)
              : profiles.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-white break-all">{p.email || "No disponible"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.role || "basico"}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-gray-600 border border-gray-500 text-white rounded-md p-2"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.can_upload_blog || false}
                          onChange={() => handleCanUploadBlogChange(p.id, p.can_upload_blog)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
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
          Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span>
          <span className="ms-2 text-gray-500">({total} en total)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <button
            className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
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