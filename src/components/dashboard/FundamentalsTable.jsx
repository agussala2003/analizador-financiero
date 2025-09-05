import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { exportToCSV, exportToXLSX } from "../../lib/export";
import { exportTablesToPDF } from "../../lib/exportPdf";
import { useError } from "../../context/ErrorContext";

// Estructura para dividir los indicadores en secciones
const indicatorSections = [
  {
    id: "valuation",
    title: "Métricas de Valoración",
    subtitle: "Ratios para medir la valoración relativa de la empresa.",
    keys: ["PER", "priceToBook", "priceToSales", "pfc_ratio", "evToEbitda", "evToSales", "earningsYield", "grahamNumber", "marketCap"],
    defaultOpen: true,
  },
  {
    id: "profitability",
    title: "Rentabilidad y Márgenes",
    subtitle: "Eficiencia de la empresa para generar beneficios.",
    keys: ["grossMargin", "operatingMargin", "roe", "roa", "roic", "rdToRevenue"],
    defaultOpen: false,
  },
  {
    id: "financialHealth",
    title: "Salud Financiera y Liquidez",
    subtitle: "Niveles de deuda y capacidad de pago a corto plazo.",
    keys: ["debtToEquity", "netDebtToEBITDA", "debt_to_assets", "currentRatio", "cashConversionCycle", "dso", "dio", "incomeQualityTTM"],
    defaultOpen: false,
  },
  {
    id: "technical",
    title: "Indicadores Técnicos y de Mercado",
    subtitle: "Volatilidad, momentum y sentimiento del mercado.",
    keys: ["beta", "relativeVolume", "rsi14", "sma50", "sma200", "smaSignal", "dist52wHigh", "dist52wLow"],
    defaultOpen: false,
  },
];

/* ------------ UI helpers ------------ */
function InfoModal({ isOpen, onClose, title, content }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-5">
          <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
        </main>
      </div>
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AccordionSection({ title, subtitle, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-left text-white/90 hover:text-white focus:outline-none w-full"
          aria-expanded={open}
        >
          <Chevron open={open} />
          <div>
            <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-[11px] sm:text-xs text-gray-400">{subtitle}</p>}
          </div>
        </button>
      </header>
      <div
        className={`transition-[max-height,opacity] duration-300 ease-out ${open ? "opacity-100" : "opacity-0"}`}
        style={{ maxHeight: open ? "2000px" : 0, overflow: "hidden" }}
      >
        {children}
      </div>
    </section>
  );
}

/* ------------ formatting & badges ------------ */
function formatLargeNumber(num) {
  if (typeof num !== "number") return "N/A";
  if (Math.abs(num) >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function valueToDisplay(config, value) {
  if (typeof value !== "number") return value ?? "N/A";
  if (config.isLargeNumber) return formatLargeNumber(value);
  if (config.isPercentage || config.asPercent) return `${value.toFixed(2)}%`;
  return value.toFixed(2);
}
function trafficLightClass(config, value) {
  if (typeof value !== "number") return "";
  const { green, yellow, lowerIsBetter } = config;
  if (lowerIsBetter) {
    if (value <= green) return "bg-emerald-600/20 text-emerald-300";
    if (value <= yellow) return "bg-amber-600/20 text-amber-300";
    return "bg-rose-600/20 text-rose-300";
  } else {
    if (value >= green) return "bg-emerald-600/20 text-emerald-300";
    if (value >= yellow) return "bg-amber-600/20 text-amber-300";
    return "bg-rose-600/20 text-rose-300";
  }
}
function NA_Badge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-700/60 text-gray-300 text-xs italic">
      N/A
    </span>
  );
}

/* ------------ Sub-componente para la tabla ------------ */
function IndicatorTable({ sectionKeys, hideNA, onShowInfo }) {
  const { selectedTickers, assetsData, indicatorConfig } = useDashboard();

  const visibleKeys = useMemo(() => {
    if (!indicatorConfig) return [];
    if (!hideNA) return sectionKeys;
    return sectionKeys.filter((k) =>
      selectedTickers.some((t) => {
        const v = assetsData[t]?.data?.[k];
        return v !== undefined && v !== null && v !== "N/A";
      })
    );
  }, [indicatorConfig, sectionKeys, selectedTickers, assetsData, hideNA]);

  if (!visibleKeys.length) {
    return (
      <p className="px-4 sm:px-6 py-4 text-sm text-gray-400">
        No hay indicadores disponibles para mostrar en esta sección con los filtros actuales.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-[12px] sm:text-sm text-left text-gray-300">
        <thead className="text-[11px] sm:text-xs text-gray-400 uppercase bg-gray-900/50">
          <tr>
            <th className="px-4 sm:px-6 py-3">Indicador</th>
            {selectedTickers.map((t) => (
              <th key={t} className="px-4 sm:px-6 py-3 text-center">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleKeys.map((key) => {
            const cfg = indicatorConfig[key];
            if (!cfg) return null;
            return (
              <tr key={key} className="border-b border-gray-700">
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-white whitespace-nowrap">
                  <div className="flex items-center">
                    <span>{cfg.label}</span>
                    {cfg.explanation && (
                      <button
                        onClick={() => onShowInfo(cfg.label, cfg.explanation)}
                        className="ml-2 text-gray-400 hover:text-white"
                        aria-label={`Ver explicación de ${cfg.label}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
                {selectedTickers.map((t) => {
                  const val = assetsData[t]?.data?.[key];
                  const cls = trafficLightClass(cfg, val);
                  const isNA = val === undefined || val === null || val === "N/A" || Number.isNaN(val);
                  return (
                    <td key={t} className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      {isNA ? <NA_Badge /> : <span className={`px-2 py-1 rounded ${cls}`}>{valueToDisplay(cfg, val)}</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------ Componente principal ------------ */
export default function FundamentalsTable() {
  const { selectedTickers, assetsData, indicatorConfig } = useDashboard();
  const { showError } = useError();
  const [hideNA, setHideNA] = useState(true);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: '' });

  const handleShowInfo = (title, content) => setModalData({ isOpen: true, title, content });
  const handleCloseModal = () => setModalData({ isOpen: false, title: '', content: '' });

  if (!selectedTickers.length) return null;

  const getAllVisibleKeys = () => {
    if (!indicatorConfig) return [];
    return indicatorSections.flatMap(section =>
      hideNA
        ? section.keys.filter(k =>
          selectedTickers.some(t => {
            const v = assetsData[t]?.data?.[k];
            return v !== undefined && v !== null && v !== "N/A";
          })
        )
        : section.keys
    );
  };

  const handleExportCSV = () => {
    const headers = ["Indicador", ...selectedTickers];
    const rows = getAllVisibleKeys().map((key) => {
      const cfg = indicatorConfig[key];
      const row = [cfg.label];
      selectedTickers.forEach((t) => row.push(valueToDisplay(cfg, assetsData[t]?.data?.[key])));
      return row;
    });
    exportToCSV({ filename: "fundamentals.csv", headers, rows });
  };

  const handleExportXLSX = async () => {
    try {
      const headers = ["Indicador", ...selectedTickers];
      const rows = getAllVisibleKeys().map((key) => {
        const cfg = indicatorConfig[key];
        const rowData = [cfg.label];
        selectedTickers.forEach((t) => {
          const v = assetsData[t]?.data?.[key];
          if (typeof v === 'number' && (cfg.isPercentage || cfg.asPercent)) {
            rowData.push(v / 100);
          } else {
            rowData.push(typeof v === 'number' ? v : null);
          }
        });
        return rowData;
      });
      await exportToXLSX({
        filename: "fundamentals.xlsx",
        sheets: { Fundamentals: { headers, rows } },
      });
    } catch (e) {
      showError("Para exportar a Excel, instala la dependencia 'xlsx'.", { detail: e.message });
    }
  };

  // Dentro de FundamentalsTable.jsx
const handleExportPDF = () => {
  const pdfSections = indicatorSections.map(section => {
    const head = ["Indicador", ...selectedTickers];
    const sectionVisibleKeys = hideNA
      ? section.keys.filter(k => selectedTickers.some(t => assetsData[t]?.data?.[k] != null && assetsData[t]?.data?.[k] !== "N/A"))
      : section.keys;

    if (sectionVisibleKeys.length === 0) return null;

    const body = sectionVisibleKeys.map(key => {
      const cfg = indicatorConfig[key];
      return [
        cfg.label,
        ...selectedTickers.map(t => valueToDisplay(cfg, assetsData[t]?.data?.[key]))
      ];
    });

    // 🎨 Colores estilo Tailwind (tonos aproximados a las badges)
    const GREEN_BG = [16, 185, 129];   // emerald-500 aprox
    const YELLOW_BG = [245, 158, 11];  // amber-500 aprox
    const RED_BG = [239, 68, 68];      // rose-500 aprox
    const DARK_TEXT = [31, 41, 55];    // gray-800 (como en la UI)

    const opts = {
      didParseCell: (data) => {
        // Solo pintar cuerpo; col 0 = nombre indicador
        if (data.section !== "body" || data.column.index === 0) return;

        const rowKey = sectionVisibleKeys[data.row.index];
        const cfg = indicatorConfig[rowKey];
        if (!cfg) return;

        const raw = data.cell.raw;
        const val = typeof raw === "number" ? raw : parseFloat(String(raw).replace("%", "").replace(",", "."));
        if (!Number.isFinite(val)) return;

        const v = typeof raw === "string" && raw.includes("%") ? val : val; // ya está normalizado

        // Umbrales
        const { green, yellow, lowerIsBetter } = cfg;
        let fill = null;
        if (typeof v === "number") {
          if (lowerIsBetter) {
            if (v <= green) fill = GREEN_BG;
            else if (v <= yellow) fill = YELLOW_BG;
            else fill = RED_BG;
          } else {
            if (v >= green) fill = GREEN_BG;
            else if (v >= yellow) fill = YELLOW_BG;
            else fill = RED_BG;
          }
        }
        if (fill) {
          data.cell.styles.fillColor = fill;
          data.cell.styles.textColor = DARK_TEXT;
          data.cell.styles.fontStyle = "bold";
        }
      }
    };

    return { title: section.title, head, body, opts };
  }).filter(Boolean);

  if (pdfSections.length === 0) {
    showError("No hay datos visibles para exportar a PDF.");
    return;
  }

  exportTablesToPDF({
    filename: "fundamentals.pdf",
    orientation: selectedTickers.length > 4 ? "l" : "p",
    subtitle: `Comparativa para: ${selectedTickers.join(", ")}`,
    sections: pdfSections,
  });
};


  return (
    <>
      <div className="space-y-4">
        {/* Controles Globales */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 py-3 bg-gray-800/50 rounded-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white text-center sm:text-left">
            Tabla Comparativa de Indicadores
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="flex items-center gap-2 text-[12px] sm:text-xs text-gray-300">
              <input
                type="checkbox"
                className="accent-indigo-500"
                checked={hideNA}
                onChange={() => setHideNA(!hideNA)}
              />
              Ocultar filas N/A
            </label>
            <button onClick={handleExportCSV} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-[12px] sm:text-xs">Exportar CSV</button>
            <button onClick={handleExportXLSX} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-[12px] sm:text-xs">Exportar Excel</button>
            <button onClick={handleExportPDF} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-[12px] sm:text-xs">Exportar PDF</button>
          </div>
        </div>

        {/* Secciones de Acordeones */}
        {indicatorSections.map(section => (
          <AccordionSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            defaultOpen={section.defaultOpen}
          >
            <IndicatorTable
              sectionKeys={section.keys}
              hideNA={hideNA}
              onShowInfo={handleShowInfo}
            />
          </AccordionSection>
        ))}
      </div>

      <InfoModal
        isOpen={modalData.isOpen}
        onClose={handleCloseModal}
        title={modalData.title}
        content={modalData.content}
      />
    </>
  );
}
