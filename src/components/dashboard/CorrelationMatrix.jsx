import { useMemo } from "react";
import { useDashboard } from "../../hooks/useDashboard";
import { exportTablesToPDF } from "../../lib/exportPdf";
import { correlation } from "../../utils/math";
function cellStyle(value) {
  const hue = (value + 1) * 60; // [-1..1] -> [0..120] HSL
  return { backgroundColor: `hsl(${hue}, 80%, 75%)`, color: '#1f2937' };
}
function hslToRgb(h, s, l) {
  // h: [0..360], s/l: [0..1]  -> return [r,g,b] 0..255
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let [r1, g1, b1] = [0, 0, 0];
  if (0 <= hp && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
  else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
  else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
  else if (5 <= hp && hp < 6) [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return [r, g, b];
}

export default function CorrelationMatrix() {
  const { selectedTickers, assetsData } = useDashboard();
  const rows = useMemo(
    () => selectedTickers.map(t => ({ t, r: assetsData[t]?.historicalReturns || [] })),
    [selectedTickers, assetsData]
  );

  const hasAnySeries = rows.some(r => (r.r?.length ?? 0) > 1);
  if (!selectedTickers.length) return null;

  const handleExportPDF = () => {
  const head = ["Ticker", ...selectedTickers];
  const body = selectedTickers.map(rT => {
    const row = [rT];
    selectedTickers.forEach(cT => {
      const value = rT === cT
        ? 1
        : correlation(assetsData[rT]?.historicalReturns || [], assetsData[cT]?.historicalReturns || []);
      row.push(Number.isFinite(value) ? value.toFixed(2) : "0.00");
    });
    return row;
  });

  // 🎨 Hook para colorear cada celda como en la UI:
  const opts = {
    didParseCell: (data) => {
      // Solo cuerpo de la tabla
      if (data.section !== 'body') return;

      // Columna 0 = nombre de ticker (no colorear)
      if (data.column.index === 0) return;

      const raw = data.cell.raw;
      const num = typeof raw === "number" ? raw : parseFloat(String(raw).replace(',', '.'));

      if (!Number.isFinite(num)) return;

      // Misma escala que en la UI: hue = (v+1)*60 ; s=80% ; l=75%
      const hue = (num + 1) * 60;     // [-1..1] -> [0..120]
      const [r, g, b] = hslToRgb(hue, 0.8, 0.75);

      // Fondo de celda
      data.cell.styles.fillColor = [r, g, b];

      // Mismo color de texto que usás (#1f2937)
      data.cell.styles.textColor = [31, 41, 55];
      data.cell.styles.fontStyle = 'bold';
    }
  };

  exportTablesToPDF({
    filename: "matriz_correlacion.pdf",
    orientation: "l",
    subtitle: new Date().toLocaleString(),
    sections: [
      {
        title: "Matriz de Correlación",
        head,
        body,
        opts, // ← pasamos el hook
      }
    ],
  });
};

  return (
    <section className="card bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Matriz de Correlación</h2>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
              Correlación de retornos diarios (−1 a 1). {hasAnySeries ? "" : "Aún no hay suficientes datos históricos para calcular correlaciones."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="cursor-pointer px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[12px] sm:text-sm text-left text-gray-300">
          <thead className="text-[11px] sm:text-xs text-gray-400 uppercase bg-gray-900/50">
            <tr>
              <th className="px-4 sm:px-6 py-3" aria-label="tickers columna" />
              {rows.map(({ t }) => (
                <th key={t} className="px-4 sm:px-6 py-3 text-center">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.t} className="border-b border-gray-700">
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-white text-center sticky left-0 bg-gray-800/70 backdrop-blur">
                  {row.t}
                </th>
                {rows.map((col, j) => {
                  const value = i === j ? 1 : correlation(row.r, col.r);
                  return (
                    <td key={col.t} className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold" style={cellStyle(value)}>
                      {(Number.isFinite(value) ? value : 0).toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
