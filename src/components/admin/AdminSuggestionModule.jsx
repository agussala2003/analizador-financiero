// src/components/admin/AdminSuggestionModule.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useError } from "../../hooks/useError";
import { useConfig } from "../../hooks/useConfig";
import { logger } from "../../lib/logger";

// --- Mapeo de Estilos para Estados ---
const STATUS_META = {
  nueva: { label: "Nueva", color: "bg-blue-500/20 text-blue-300" },
  planeada: { label: "Planeada", color: "bg-indigo-500/20 text-indigo-200" },
  completada: { label: "Completada", color: "bg-green-500/20 text-green-200" },
  rechazada: { label: "Rechazada", color: "bg-red-500/20 text-red-200" },
};

const STATUS_OPTIONS = [
  { value: "nueva", label: "Nueva" },
  { value: "planeada", label: "Planeada" },
  { value: "completada", label: "Completada" },
  { value: "rechazada", label: "Rechazada" },
];

// --- Componente de Tarjeta de Sugerencia Rediseñado ---
function SuggestionCard({ suggestion, onStatusChange }) {
  const meta = STATUS_META[suggestion.status] || { label: suggestion.status || "—", color: "bg-gray-500/20 text-gray-200" };
  // ✅ Ahora `profile` está anidado dentro de cada sugerencia
  const authorName = suggestion.profile?.first_name 
    ? `${suggestion.profile.first_name} ${suggestion.profile.last_name || ''}`.trim() 
    : (suggestion.profile?.email || 'Usuario anónimo');

  return (
    <article className="rounded-xl border border-gray-700 bg-gray-800/40 p-4 space-y-4">
      <p className="text-gray-200 text-sm leading-relaxed">{suggestion.content || "—"}</p>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-700 pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span className="font-semibold text-gray-300 truncate" title={authorName}>{authorName}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400">{new Date(suggestion.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-gray-500">·</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <div className="w-full md:w-auto">
          <select
            value={suggestion.status || "nueva"}
            onChange={(e) => onStatusChange(suggestion.id, e.target.value)}
            className="w-full md:w-40 bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}

// --- Componente Principal del Módulo ---
export default function AdminSuggestionsModule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const { showError, showSuccess } = useError();
  const config = useConfig();
  const PAGE_SIZE_OPTIONS = config.admin.pageSizeOptions || [5, 10, 20];

  const fetchPage = useCallback(async (p, ps) => {
    setLoading(true);
    logger.info('ADMIN_SUGGESTIONS_FETCH_START', `Admin fetching suggestions page ${p} with pageSize ${ps}`, { 
      page: p, 
      pageSize: ps, 
      searchQuery: q 
    });
    
    try {
      // --- PASO 1: Obtener las sugerencias ---
      const from = (p - 1) * ps;
      const to = from + ps - 1;

      let suggestionsQuery = supabase
        .from("suggestions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (q && q.trim()) {
        suggestionsQuery = suggestionsQuery.ilike("content", `%${q.trim()}%`);
      }

      const { data: suggestionsData, error: suggestionsError, count } = await suggestionsQuery.range(from, to);
      if (suggestionsError) throw suggestionsError;
      if (!suggestionsData || suggestionsData.length === 0) {
        logger.info('ADMIN_SUGGESTIONS_FETCH_SUCCESS', 'No suggestions found for query', { 
          page: p, 
          pageSize: ps, 
          searchQuery: q 
        });
        setItems([]);
        setTotal(0);
        return;
      }
      
      // --- PASO 2: Obtener los perfiles de los autores ---
      const userIds = suggestionsData.map(s => s.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      // --- PASO 3: Unir los datos en el código ---
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));
      const combinedData = suggestionsData.map(suggestion => ({
        ...suggestion,
        profile: profilesMap.get(suggestion.user_id) || null
      }));

      logger.info('ADMIN_SUGGESTIONS_FETCH_SUCCESS', `Successfully fetched ${combinedData.length} suggestions`, { 
        page: p, 
        pageSize: ps, 
        totalSuggestions: count, 
        searchQuery: q 
      });
      setItems(combinedData);
      setTotal(count ?? 0);

    } catch (err) {
      logger.error('ADMIN_SUGGESTIONS_FETCH_FAILED', 'Failed to fetch suggestions for admin', { 
        page: p, 
        pageSize: ps, 
        searchQuery: q, 
        errorMessage: err.message 
      });
      showError("No se pudieron cargar las sugerencias.", { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [q, showError]);
  
  // Lógica de paginación corregida
  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  useEffect(() => {
    fetchPage(page, pageSize);
  }, [page, pageSize, fetchPage]);

  const updateStatus = async (id, newStatus) => {
    const previousStatus = items.find(item => item.id === id)?.status;
    logger.info('ADMIN_SUGGESTION_STATUS_CHANGE_START', `Admin changing suggestion status from ${previousStatus} to ${newStatus}`, { 
      suggestionId: id, 
      previousStatus, 
      newStatus 
    });
    
    const { error } = await supabase.from("suggestions").update({ status: newStatus }).eq("id", id);
    if (error) {
      logger.error('ADMIN_SUGGESTION_STATUS_CHANGE_FAILED', 'Failed to update suggestion status', { 
        suggestionId: id, 
        previousStatus, 
        newStatus, 
        errorMessage: error.message 
      });
      showError("No se pudo actualizar el estado.", { detail: error.message });
    } else {
      logger.info('ADMIN_SUGGESTION_STATUS_CHANGE_SUCCESS', `Suggestion status successfully changed to ${newStatus}`, { 
        suggestionId: id, 
        previousStatus, 
        newStatus 
      });
      showSuccess("Estado actualizado.");
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Sugerencias de Usuarios</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por contenido..."
            className="w-full sm:w-72 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (<option key={n} value={n}>{n}/pág.</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-700 bg-gray-800/40 p-4 h-32 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h4 className="text-xl font-bold text-white">No hay sugerencias</h4>
          <p className="text-gray-400 mt-2">No se encontraron sugerencias que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} onStatusChange={updateStatus} />
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm">
          <div className="text-gray-400">
            Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span>
            <span className="ms-2 text-gray-500">({total} en total)</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50" onClick={() => setPage(p => p - 1)} disabled={!canPrev}>Anterior</button>
            <button className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50" onClick={() => setPage(p => p + 1)} disabled={!canNext}>Siguiente</button>
          </div>
        </div>
      )}
    </section>
  );
}