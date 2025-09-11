// src/components/common/CompanyInfoModal.jsx
import { useEffect, useState } from "react";

function Stat({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-100">{value}</span>
    </div>
  );
}

function formatNumber(n) {
  if (n === null || n === undefined || n === "N/A") return "N/A";
  const num = Number(n);
  if (!isFinite(num)) return "N/A";
  return num.toLocaleString();
}

function formatMoney(n, currency = "USD") {
  if (n === null || n === undefined || isNaN(n)) return "N/A";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(n));
}

function formatMarketCap(n) {
  const num = Number(n);
  if (!isFinite(num)) return "N/A";
  const units = ["", "K", "M", "B", "T"];
  let u = 0;
  let x = num;
  while (x >= 1000 && u < units.length - 1) { x /= 1000; u++; }
  return `${x.toFixed(2)}${units[u]}`;
}

export default function CompanyInfoModal({ open, onClose, data }) {
  // Cerrar con ESC y bloquear scroll
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  if (!data) return null;

  const MAX_LENGTH = 250; // cantidad de caracteres a mostrar inicialmente

  const {
    symbol,
    companyName,
    image,
    website,
    description,
    sector,
    industry,
    country,
    exchangeFullName,
    ceo,
    employees,
    currency,
    currentPrice,
    marketCap,
    beta,
    lastDividend,
    range,
    volume,
    averageVolume,
    ipoDate
  } = data;

  // Soporte: si no viene image en processed, usamos el de FMP por ticker
  const logo = image || (symbol ? `https://images.financialmodelingprep.com/symbol/${symbol}.png` : null);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-info-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Card */}
      <div className="relative w-[92vw] max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-800/60 border-b border-gray-700">
          {logo && (
            <img
              src={logo}
              alt={`${companyName || symbol} logo`}
              className="w-10 h-10 rounded-md object-contain bg-white/5 p-1"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <h3 id="company-info-title" className="text-lg font-semibold text-white truncate">
              {companyName || symbol}
            </h3>
            <p className="text-xs text-gray-400">
              {symbol} • {exchangeFullName || "—"}
            </p>
          </div>
          <button
            className="ml-auto px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
            onClick={onClose}
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Primary stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Precio actual" value={formatMoney(currentPrice, currency || "USD")} />
            <Stat label="Market Cap" value={formatMarketCap(marketCap)} />
            <Stat label="Beta" value={beta ?? "N/A"} />
            <Stat label="Último dividendo" value={lastDividend ?? "N/A"} />
            <Stat label="Rango 52w" value={range ?? "N/A"} />
            <Stat label="Volumen" value={formatNumber(volume)} />
            <Stat label="Vol. Promedio" value={formatNumber(averageVolume)} />
            <Stat label="Sector" value={sector} />
            <Stat label="Industria" value={industry} />
            <Stat label="País" value={country} />
            <Stat label="CEO" value={ceo} />
            <Stat label="Empleados" value={formatNumber(employees)} />
            <Stat label="IPO" value={ipoDate} />
          </div>

            {/* Descripción */}
            {description && (
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-200">Descripción</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                {expanded || description.length <= MAX_LENGTH
                    ? description
                    : `${description.slice(0, MAX_LENGTH)}...`}
                </p>
                {description.length > MAX_LENGTH && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-400 hover:underline text-sm"
                >
                    {expanded ? "Leer menos" : "Leer más"}
                </button>
                )}
            </div>
            )}

          {/* Website */}
          {website && (
            <div>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                Visitar sitio oficial
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17l10-10M7 7h10v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
