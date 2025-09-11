// src/components/admin/AdminLogsModule.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useError } from "../../hooks/useError";
import { useConfig } from "../../hooks/useConfig";
import Modal from '../ui/Modal'; // Reutilizamos el modal que creamos

// --- Configuración de Estilos para Niveles de Log ---
const LOG_LEVEL_META = {
  INFO: { color: "bg-blue-500/20 text-blue-300", label: "INFO" },
  WARN: { color: "bg-yellow-500/20 text-yellow-300", label: "WARN" },
  ERROR: { color: "bg-red-500/20 text-red-300", label: "ERROR" },
};

const LOG_LEVELS = ["ALL", "INFO", "WARN", "ERROR"];

// --- Componente de Tarjeta para Vista Móvil ---
function LogCard({ log, onViewMetadata }) {
  const meta = LOG_LEVEL_META[log.level] || {};
  const authorName = log.profile?.email || 'Sistema';
  
  return (
    <article className="rounded-xl border border-gray-700 bg-gray-800/40 p-4 space-y-3 text-sm">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-white break-all pr-2">{log.message}</p>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>{meta.label}</span>
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <p><span className="font-medium text-gray-300">Tipo:</span> {log.event_type}</p>
        <p><span className="font-medium text-gray-300">Usuario:</span> {authorName}</p>
        <p><span className="font-medium text-gray-300">Fecha:</span> {new Date(log.created_at).toLocaleString('es-ES')}</p>
      </div>
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="pt-2 border-t border-gray-700">
          <button onClick={() => onViewMetadata(log.metadata)} className="text-blue-400 hover:underline text-xs">Ver Metadatos</button>
        </div>
      )}
    </article>
  );
}


// --- Componente Principal del Módulo de Logs ---
export default function AdminLogsModule() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Removed setPageSize as it's not used
  const [total, setTotal] = useState(0);
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  
  // Filtros
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  const { showError } = useError();
  const config = useConfig();
  const PAGE_SIZE_OPTIONS = config.admin.pageSizeOptions || [10, 20, 50];

  const fetchPage = useCallback(async (p, ps) => {
    setLoading(true);
    try {
      const from = (p - 1) * ps;
      const to = from + ps - 1;

      // --- PASO 1: Obtener los logs paginados ---
      let query = supabase
        .from("logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      
      if (levelFilter !== "ALL") {
        query = query.eq('level', levelFilter);
      }
      if (eventTypeFilter) {
        query = query.ilike('event_type', `%${eventTypeFilter.trim()}%`);
      }

      const { data: logsData, error: logsError, count } = await query.range(from, to);
      if (logsError) throw logsError;
      if (!logsData || logsData.length === 0) {
        setLogs([]);
        setTotal(0);
        return;
      }
      
      // --- PASO 2: Obtener los perfiles de los usuarios de esos logs ---
      const userIds = [...new Set(logsData.map(log => log.user_id).filter(Boolean))];
      let profilesMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        
        if (profilesError) throw profilesError;
        profilesMap = new Map(profilesData.map(p => [p.id, p]));
      }

      // --- PASO 3: Unir los logs con sus perfiles correspondientes ---
      const combinedLogs = logsData.map(log => ({
        ...log,
        profile: profilesMap.get(log.user_id) || null
      }));

      setLogs(combinedLogs);
      setTotal(count ?? 0);

    } catch (err) {
      showError("No se pudieron cargar los logs.", { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [showError, levelFilter, eventTypeFilter]);

  useEffect(() => {
    setPage(1);
  }, [levelFilter, eventTypeFilter, pageSize]);

  useEffect(() => {
    fetchPage(page, pageSize);
  }, [page, pageSize, fetchPage]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <>
      <section className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Logs de la Aplicación</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm">
              {LOG_LEVELS.map(level => <option key={level} value={level}>{level === 'ALL' ? 'Todos los niveles' : level}</option>)}
            </select>
            <input
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              placeholder="Buscar por tipo de evento..."
              className="w-full sm:w-60 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-xl font-bold">No se encontraron logs</h4>
            <p className="text-gray-400 mt-2">Prueba ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          <>
            {/* Vista Móvil */}
            <div className="md:hidden space-y-3">
              {logs.map(log => <LogCard key={log.id} log={log} onViewMetadata={setSelectedMetadata} />)}
            </div>

            {/* Vista Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="px-4 py-3">Nivel</th>
                    <th className="px-4 py-3">Mensaje</th>
                    <th className="px-4 py-3">Tipo de Evento</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const meta = LOG_LEVEL_META[log.level] || {};
                    const authorName = log.profile?.email || 'Sistema';
                    return (
                      <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>{meta.label}</span></td>
                        <td className="px-4 py-3 text-white">{log.message}</td>
                        <td className="px-4 py-3 text-gray-300">{log.event_type}</td>
                        <td className="px-4 py-3 text-gray-300">{authorName}</td>
                        <td className="px-4 py-3 text-gray-300">{new Date(log.created_at).toLocaleString('es-ES')}</td>
                        <td className="px-4 py-3">
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button onClick={() => setSelectedMetadata(log.metadata)} className="cursor-pointer text-blue-400 hover:underline text-xs">Ver</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm">
            <div className="text-gray-400">Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span> ({total} en total)</div>
            <div className="flex items-center gap-2">
              <button className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50" onClick={() => setPage(p => p - 1)} disabled={!canPrev}>Anterior</button>
              <button className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50" onClick={() => setPage(p => p + 1)} disabled={!canNext}>Siguiente</button>
            </div>
          </div>
        )}
      </section>

      <Modal isOpen={!!selectedMetadata} onClose={() => setSelectedMetadata(null)} title="Metadatos del Log">
        {selectedMetadata && (
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-white overflow-x-auto">
            {JSON.stringify(selectedMetadata, null, 2)}
          </pre>
        )}
      </Modal>
    </>
  );
}