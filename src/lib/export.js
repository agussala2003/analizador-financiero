// src/lib/export.js
// Utilidades simples para exportar CSV y (opcional) Excel con SheetJS.

function toCsvValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Si contiene comas, comillas o saltos de línea → envolver en comillas
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToCSV({ filename = 'export.csv', headers = [], rows = [] }) {
  const headerLine = headers.map(toCsvValue).join(',');
  const dataLines = rows.map(r => r.map(toCsvValue).join(','));
  const csv = [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(filename, blob);
}

// Excel opcional con SheetJS.
// 1) Instalar:  npm i xlsx
// 2) Se usa import dinámico para no inflar el bundle si no hace falta.
export async function exportToXLSX({ filename = 'export.xlsx', sheets }) {
  // sheets: { 'Hoja1': { headers:[], rows:[] }, 'Hoja2': {...} }
  try {
    const XLSX = await import('xlsx'); // dynamic
    const wb = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, table]) => {
      const { headers = [], rows = [] } = table;
      const array = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(array);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // 31 chars max
    });

    XLSX.writeFile(wb, filename);
  } catch (e) {
    throw new Error('Para exportar a Excel necesitás instalar la dependencia "xlsx".');
  }
}
