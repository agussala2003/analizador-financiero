// src/components/admin/AdminSuggestionModule.jsx
// Reemplazo completo (igual funcionalidad + mejoras responsive)
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useError } from "../../context/ErrorContext";

const STATUS_META = {
  nueva: { label: "Nueva", color: "bg-blue-500/20 text-blue-200" },
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

const PAGE_SIZE_OPTIONS = [2, 5, 10];

function normalizeStatusForDB(v) {
  if (!v) return "nueva";
  return String(v).trim().toLowerCase().replace(/\s+/g, "_");
}

function statusMeta(value) {
  const raw = String(value || "").trim().toLowerCase();
  return (
    STATUS_META[raw] ||
    STATUS_META[normalizeStatusForDB(raw)] || { label: value || "—", color: "bg-gray-500/20 text-gray-200" }
  );
}

export default function AdminSuggestionsModule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [total, setTotal] = useState(0);

  const { showError } = useError();

  const fetchPage = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const from = (p - 1) * ps;
      const to = from + ps - 1;

      let query = supabase
        .from("suggestions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (q && q.trim()) {
        const term = q.trim();
        query = query.or(`content.ilike.%${term}%,status.ilike.%${term}%,user_id.ilike.%${term}%`);
      }

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      setItems(data ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      showError("No se pudieron cargar las sugerencias.", {
        title: "Error al Cargar Datos",
        detail: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPage(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, q]);

  useEffect(() => {
    fetchPage(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filtered = useMemo(() => items, [items]);

  const updateStatus = async (id, nextUIValue) => {
    const nextDBValue = normalizeStatusForDB(nextUIValue);
    const prev = [...items];
    setItems((curr) => curr.map((s) => (s.id === id ? { ...s, status: nextDBValue } : s)));

    try {
      const { error } = await supabase.from("suggestions").update({ status: nextDBValue }).eq("id", id);
      if (error) throw error;
      await fetchPage(page, pageSize);
    } catch (err) {
      setItems(prev);
      showError("No se pudo actualizar el estado.", {
        title: "Error de Actualización",
        detail: err.message,
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="animate-fade-in">
      {/* Header + filtros: apilado en mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Sugerencias</h3>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto lg:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por contenido, estado o user_id…"
            className="w-full sm:w-80 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 text-sm"
            title="Resultados por página"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}/pág.
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin resultados.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const meta = statusMeta(s.status);
            return (
              <article key={s.id} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
                <div className="flex flex-col gap-3">
                  {/* Top row: badges se ajustan y envuelven */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-gray-400">
                      · {new Date(s.created_at).toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      · upvotes: <strong className="text-gray-200">{s.upvotes ?? 0}</strong>
                    </span>
                    <span className="text-gray-500">· user: {s.user_id?.slice(0, 8)}…</span>
                    <span className="text-gray-500 hidden sm:inline">· id: {s.id.slice(0, 8)}…</span>
                  </div>

                  {/* Contenido con buen leading en móvil */}
                  <p className="text-gray-200 text-sm leading-relaxed break-words">{s.content || "—"}</p>

                  {/* Selector de estado con ancho fijo en sm y full en xs */}
                  <div className="w-full sm:w-64">
                    <label className="text-xs text-gray-400 block mb-1">Actualizar estado</label>
                    <select
                      value={normalizeStatusForDB(s.status) || "nueva"}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Paginación responsive */}
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
