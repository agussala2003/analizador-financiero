// src/components/dashboard/PriceAnalysisTable.jsx
import { useMemo, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { exportToCSV, exportToXLSX } from "../../lib/export";
import { exportTablesToPDF } from "../../lib/exportPdf";
import { useError } from "../../context/ErrorContext";
import CompanyInfoModal from "../common/CompanyInfoModal";

function formatCurrency(v) { return typeof v === "number" ? `$${v.toFixed(2)}` : "N/A"; }
function pctNode(v) {
  if (typeof v !== "number") return "N/A";
  const cls = v >= 0 ? "text-green-400" : "text-red-400";
  return <span className={cls}>{v.toFixed(2)}%</span>;
}
function num(v) { return typeof v === "number" ? v : Number.NEGATIVE_INFINITY; }
function asPct(v) { return (typeof v === "number") ? `${v.toFixed(2)}%` : "N/A"; }
function safeNum(v) { return (typeof v === "number") ? v : null; }

function InfoIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8.5h.01M11 11h2v5h-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PriceAnalysisTable() {
  const { selectedTickers, assetsData, loading } = useDashboard();
  const { profile } = useAuth();
  const role = (profile?.role || "basico").toLowerCase();
  const { showError } = useError();

  const [sort, setSort] = useState({ key: "ticker", dir: "asc" });
  const [openInfoFor, setOpenInfoFor] = useState(null);   // ticker | null

  const rows = useMemo(() => {
    const base = selectedTickers.map((t) => ({ ticker: t, ...(assetsData[t] ?? {}) }));
    const dirMul = sort.dir === "asc" ? 1 : -1;
    const getVal = (r) => {
      switch (sort.key) {
        case "price": return num(r.currentPrice);
        case "day": return num(r.dayChange);
        case "mon": return num(r.monthChange);
        case "yr": return num(r.yearChange);
        case "vol": return num(r.stdDev);
        case "sharpe": return num(r.sharpeRatio);
        default: return r.ticker;
      }
    };
    return [...base].sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * dirMul;
    });
  }, [selectedTickers, assetsData, sort]);

  if (!selectedTickers.length) return null;
  const noData = selectedTickers.every(t => !assetsData[t]);

  // --- EXPORT HANDLERS ---
  const handleExportCSV = () => {
    const headers = ["Ticker", "Precio (USD)", "Var Diaria", "Var Mensual", "Var Anual", "Volatilidad (30d)", "Sharpe"];
    const dataRows = rows.map(r => ([
      r.ticker,
      safeNum(r.currentPrice) ?? "N/A",
      asPct(r.dayChange),
      asPct(r.monthChange),
      asPct(r.yearChange),
      asPct(r.stdDev),
      (typeof r.sharpeRatio === "number") ? r.sharpeRatio.toFixed(2) : "N/A",
    ]));
    exportToCSV({ filename: "precios_y_volatilidad.csv", headers, rows: dataRows });
  };

  const handleExportXLSX = async () => {
    try {
      const headers = ["Ticker", "Precio (USD)", "Var Diaria", "Var Mensual", "Var Anual", "Vol (30d)", "Sharpe"];
      const dataRows = rows.map(r => ([
        r.ticker,
        safeNum(r.currentPrice),
        (typeof r.dayChange === "number") ? r.dayChange / 100 : null,
        (typeof r.monthChange === "number") ? r.monthChange / 100 : null,
        (typeof r.yearChange === "number") ? r.yearChange / 100 : null,
        (typeof r.stdDev === "number") ? r.stdDev / 100 : null,
        (typeof r.sharpeRatio === "number") ? r.sharpeRatio : null,
      ]));
      await exportToXLSX({
        filename: "precios_y_volatilidad.xlsx",
        sheets: { "Precios": { headers, rows: dataRows } }
      });
    } catch (e) {
      showError("Para exportar a Excel instalá la dependencia 'xlsx'.", { detail: e.message });
    }
  };

  // Dentro de PriceAnalysisTable.jsx
  const handleExportPDF = () => {
    const head = ["Ticker", "Precio (USD)", "Var Diaria", "Var Mensual", "Var Anual", "Vol (30d)", "Sharpe", "Precio Obj."];
    const body = rows.map(r => ([
      r.ticker,
      (typeof r.currentPrice === "number") ? `$${r.currentPrice.toFixed(2)}` : "N/A",
      (typeof r.dayChange === "number") ? `${r.dayChange.toFixed(2)}%` : "N/A",
      (typeof r.monthChange === "number") ? `${r.monthChange.toFixed(2)}%` : "N/A",
      (typeof r.yearChange === "number") ? `${r.yearChange.toFixed(2)}%` : "N/A",
      (typeof r.stdDev === "number") ? `${r.stdDev.toFixed(2)}%` : "N/A",
      (typeof r.sharpeRatio === "number") ? r.sharpeRatio.toFixed(2) : "N/A",
      (typeof r.lastMonthAvgPriceTarget === "number") ? `$${r.lastMonthAvgPriceTarget.toFixed(2)}` : "N/A",
    ]));

    // 🎨 tonos
    const GREEN_BG = [16, 185, 129];  // verde
    const RED_BG = [239, 68, 68];   // rojo
    const DARK_TEXT = [31, 41, 55];   // gris oscuro p/contraste

    const PCT_COLS = new Set([2, 3, 4, 5]); // índices de columnas en el PDF (0-based): % día, mes, año, vol

    const opts = {
      didParseCell: (data) => {
        if (data.section !== "body") return;
        if (!PCT_COLS.has(data.column.index)) return;

        const raw = String(data.cell.raw || "");
        const num = parseFloat(raw.replace("%", "").replace(",", "."));
        if (!Number.isFinite(num)) return;

        const bg = num >= 0 ? GREEN_BG : RED_BG;
        data.cell.styles.fillColor = bg;
        data.cell.styles.textColor = DARK_TEXT;
        data.cell.styles.fontStyle = "bold";
      }
    };

    exportTablesToPDF({
      filename: "precios_y_volatilidad.pdf",
      orientation: "l",
      subtitle: new Date().toLocaleString(),
      sections: [
        { title: "Precios y Volatilidad", head, body, opts },
      ],
    });
  };


  const Th = ({ children, sKey, center }) => (
    <th className={`px-4 sm:px-6 py-3 ${center ? 'text-center' : ''}`}>
      <button
        type="button"
        onClick={() => setSort(prev => ({ key: sKey, dir: prev.key === sKey && prev.dir === 'asc' ? 'desc' : 'asc' }))}
        className="cursor-pointer inline-flex items-center gap-1 hover:underline"
      >
        {children}
        <span className="text-[10px] opacity-70">{sort.key === sKey ? (sort.dir === 'asc' ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  );

  const getLogo = (r) =>
    r.image || (r.ticker ? `https://images.financialmodelingprep.com/symbol/${r.ticker}.png` : null);

  const infoData = openInfoFor ? assetsData[openInfoFor] : null;

  return (
    <section className="card bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Precios y Volatilidad</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleExportCSV} className="cursor-pointer px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">
              Exportar CSV
            </button>
            <button onClick={handleExportXLSX} className="cursor-pointer px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">
              Exportar Excel
            </button>
            <button onClick={handleExportPDF} className="cursor-pointer px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">
              Exportar PDF
            </button>
            {loading && <div className="text-xs text-gray-400">Cargando datos…</div>}
          </div>
        </div>
      </div>

      {(!selectedTickers.length || noData) ? (
        <div className="p-6 text-sm text-gray-400">
          No hay datos para mostrar. Agregá un ticker o reintentá la consulta.
        </div>
      ) : (
        <>
          {/* Vista móvil en cards */}
          <div className="sm:hidden space-y-3 px-4 pb-4">
            {rows.map((r) => (
              <div key={r.ticker} className="rounded-lg border border-gray-700 p-4 bg-gray-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLogo(r) && (
                      <img
                        src={getLogo(r)}
                        alt={`${r.ticker} logo`}
                        className="w-5 h-5 rounded object-contain bg-white/5 p-0.5"
                        loading="lazy"
                      />
                    )}
                    <span className="font-semibold text-white">{r.ticker}</span>
                  </div>
                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() => setOpenInfoFor(r.ticker)}
                      className="cursor-pointer p-1 rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                      title="Información de la empresa"
                      aria-label="Información de la empresa"
                    >
                      <InfoIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-sm">
                  <div className="text-gray-400">Precio</div>
                  <div className="text-right">{formatCurrency(r.currentPrice)}</div>

                  <div className="text-gray-400">Var. Día</div>
                  <div className="text-right">{pctNode(r.dayChange)}</div>

                  <div className="text-gray-400">Var. Mes</div>
                  <div className="text-right">{pctNode(r.monthChange)}</div>

                  <div className="text-gray-400">Var. Año</div>
                  <div className="text-right">{pctNode(r.yearChange)}</div>

                  <div className="text-gray-400">Vol (30d)</div>
                  <div className="text-right">{pctNode(r.stdDev)}</div>

                  <div className="text-gray-400">Sharpe</div>
                  <div className="text-right">{typeof r.sharpeRatio === "number" ? r.sharpeRatio.toFixed(2) : "N/A"}</div>

                  {/* Si es 0 el precio objetivo pon un - */}
                  <div className="text-gray-400">Precio Obj.</div>
                  <div className="text-right">{r.lastMonthAvgPriceTarget < 0.01 ? "-" : formatCurrency(r.lastMonthAvgPriceTarget)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla para ≥ sm */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                <tr>
                  <Th sKey="ticker">Ticker</Th>
                  <Th sKey="price" center>Precio</Th>
                  <Th sKey="day" center>Var. Diaria</Th>
                  <Th sKey="mon" center>Var. Mensual</Th>
                  <Th sKey="yr" center>Var. Anual</Th>
                  <Th sKey="vol" center>Volatilidad (30d)</Th>
                  <Th sKey="sharpe" center>Ratio Sharpe</Th>
                  <Th sKey="priceTarget" center>Precio Objetivo</Th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  Array.from({ length: Math.max(1, selectedTickers.length) }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-gray-700 animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-700 rounded" /></td>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4 text-center"><div className="h-4 w-16 bg-gray-700 rounded mx-auto" /></td>
                      ))}
                    </tr>
                  ))
                )}
                {!loading && rows.map((r) => (
                  <tr key={r.ticker} className="border-b border-gray-700">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {getLogo(r) && (
                          <img
                            src={getLogo(r)}
                            alt={`${r.ticker} logo`}
                            className="w-5 h-5 rounded object-contain bg-white/5 p-0.5"
                            loading="lazy"
                          />
                        )}
                        <span>{r.ticker}</span>

                        <button
                          type="button"
                          onClick={() => setOpenInfoFor(r.ticker)}
                          className="cursor-pointer p-1 rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                          title="Información de la empresa"
                          aria-label="Información de la empresa"
                        >
                          <InfoIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">{formatCurrency(r.currentPrice)}</td>
                    <td className="px-6 py-4 text-center">{pctNode(r.dayChange)}</td>
                    <td className="px-6 py-4 text-center">{pctNode(r.monthChange)}</td>
                    <td className="px-6 py-4 text-center">{pctNode(r.yearChange)}</td>
                    <td className="px-6 py-4 text-center">{pctNode(r.stdDev)}</td>
                    <td className="px-6 py-4 text-center">{typeof r.sharpeRatio === "number" ? r.sharpeRatio.toFixed(2) : "N/A"}</td>
                    <td className="px-6 py-4 text-center">{r.lastMonthAvgPriceTarget < 0.01 ? "-" : formatCurrency(r.lastMonthAvgPriceTarget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CompanyInfoModal
        open={Boolean(openInfoFor)}
        onClose={() => setOpenInfoFor(null)}
        data={infoData}
      />
    </section>
  );
}
