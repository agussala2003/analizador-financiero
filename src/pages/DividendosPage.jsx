// src/pages/DividendosPage.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { fmtDate, pct } from "../utils/financial";
import DividendCalculatorModal from "../components/dividendos/DividendCalculatorModal";
import MobileDividendCard from "../components/dividendos/MobileDividendCard";
import CalculatorIcon from "../components/dividendos/CalculatorIcon";
import { useConfig } from "../context/ConfigContext";

export default function DividendosPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [calculatorItem, setCalculatorItem] = useState(null);
  const config = useConfig();
  const PAGE_SIZE_OPTIONS = config.dividends.pageSizeOptions;

  // Filtros
  const [q, setQ] = useState(""); // símbolo
  const [frequency, setFrequency] = useState("all"); // Quarterly, Monthly, etc.
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + 1);
    return dt.toISOString().slice(0, 10);
  });

  // Paginación & orden
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("date"); // date | yield | dividend | symbol
  const [sortDir, setSortDir] = useState("asc");  // asc | desc

  useEffect(() => {
    const fetchDividends = async () => {
      setLoading(true);
      setError("");

      try {
        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        // Invocamos nuestra función de forma segura
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
          body: {
            endpointPath: 'stable/dividends-calendar'
          }
        });

        if (error) throw error;
        
        logger.info("DIVIDENDS_FETCHED", `Fetched ${Array.isArray(data) ? data.length : 0} dividend records`);
        setRows(Array.isArray(data) ? data : []);

      } catch (e) {
        setError("No se pudieron cargar los dividendos.");
        logger.error("DIVIDENDS_FETCH_FAILED", "Failed to fetch dividend records", { errorMessage: e.message });
      } finally {
        setLoading(false);
      }
    };
    fetchDividends();
  }, []);

  // Opciones de frecuencia dinámicas a partir de la data
  const frequencyOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.frequency).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [rows]);

  // Filtrado + ordenamiento
  const filtered = useMemo(() => {
    const qNorm = q.trim().toUpperCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() : null;

    let out = rows.filter((r) => {
      const symOK = !qNorm || (r.symbol || "").toUpperCase().includes(qNorm);
      const frOK = frequency === "all" || (r.frequency || "") === frequency;
      const d = r.date ? new Date(r.date).getTime() : null;
      const dateOK =
        d == null ||
        ((fromTs == null || d >= fromTs) && (toTs == null || d <= toTs));
      return symOK && frOK && dateOK;
    });

    out.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "yield":
          return ((a.yield ?? -Infinity) - (b.yield ?? -Infinity)) * dir;
        case "dividend":
          return ((a.dividend ?? -Infinity) - (b.dividend ?? -Infinity)) * dir;
        case "symbol":
          return (a.symbol || "").localeCompare(b.symbol || "") * dir;
        case "date":
        default:
          return (new Date(a.date || 0) - new Date(b.date || 0)) * dir;
      }
    });

    return out;
  }, [rows, q, frequency, from, to, sortKey, sortDir]);

  // Paginación derivada
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, clampedPage, pageSize]);

  useEffect(() => {
    // cada vez que cambian filtros, reseteo a página 1
    setPage(1);
  }, [q, frequency, from, to, pageSize, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="pb-4" aria-busy={loading ? "true" : "false"} aria-live="polite">
      <Header />

      <div className="card bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg w-11/12 sm:w-full max-w-7xl mx-auto mb-14 pb-4">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Calendario de Dividendos</h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Filtrá por símbolo, frecuencia y rango de fechas.
          </p>
        </header>

        {/* Filtros (apilados en móvil, en fila en sm+) */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 w-full">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Símbolo</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: AAPL"
                className="cursor-pointer bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="cursor-pointer bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frequencyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "all" ? "Todas" : opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Desde (Ex-Div)</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="cursor-pointer bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Hasta (Ex-Div)</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="cursor-pointer bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Controles de página / tamaño */}
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="cursor-pointer bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 text-sm"
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

        {/* Estado de carga / error */}
        {error && (
          <div role="alert" className="p-3 rounded-md mb-4 text-sm bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {loading
            ? Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                <article key={i} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 animate-pulse h-28" />
              ))
            : paged.map((it, idx) => <MobileDividendCard key={`${it.symbol}-${idx}-${it.date}`} item={it} />)}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("symbol")}>
                  Símbolo {sortKey === "symbol" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3">Frecuencia</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("date")}>
                  Fecha Ex-Div {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3">Record</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Declaración</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("dividend")}>
                  Dividendo {sortKey === "dividend" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("yield")}>
                  Rendimiento {sortKey === "yield" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="px-4 py-3" colSpan={8}>
                        <div className="h-5 w-full bg-gray-700/60 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                : paged.map((r, idx) => (
                    <tr key={`${r.symbol}-${idx}-${r.date}`} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                           <span>{r.symbol}</span>
                           <button onClick={() => setCalculatorItem(r)} className="cursor-pointer text-blue-400 hover:text-blue-300" title="Calcular dividendo">
                             <CalculatorIcon className="w-4 h-4" />
                           </button>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{r.frequency || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-300">{fmtDate(r.recordDate)}</td>
                    <td className="px-4 py-3 text-gray-300">{fmtDate(r.paymentDate)}</td>
                    <td className="px-4 py-3 text-gray-300">{fmtDate(r.declarationDate)}</td>
                    <td className="px-4 py-3 text-gray-200">${r.dividend ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-200">{pct(r.yield)}</td>
                  </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm">
          <div className="text-gray-400">
            Página <span className="text-white">{clampedPage}</span> de{" "}
            <span className="text-white">{totalPages}</span>
            <span className="ms-2 text-gray-500">({total} resultados)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={clampedPage <= 1}
            >
              Anterior
            </button>
            <button
              className="cursor-pointer px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={clampedPage >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <DividendCalculatorModal 
      isOpen={!!calculatorItem}
      onClose={() => setCalculatorItem(null)}
      item={calculatorItem}
    />
    </div>
  );
}
