// src/lib/exportPdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportTablesToPDF({
  filename = "reporte.pdf",
  sections = [],
  subtitle = "",
  orientation = "p",
}) {
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const paintDarkBg = (docInstance) => {
    docInstance.setFillColor(17, 24, 39); // #111827
    docInstance.rect(0, 0, pageWidth, pageHeight, "F");
  };

  // Pinta la primera página
  paintDarkBg(doc);

  // Encabezado principal
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Analizador de Instrumentos", 40, 40);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200);
    doc.text(subtitle, 40, 58);
  }

  let y = 80;

  sections.forEach((section, idx) => {
    const { title: secTitle, head = [], body = [], opts = {} } = section;

    if (secTitle) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255);
      doc.text(secTitle, 40, y);
      y += 10;
    }

    autoTable(doc, {
      head: [head],
      body,
      startY: y + 8,
      styles: {
        fontSize: 9,
        cellPadding: 6,
        overflow: "linebreak",
        textColor: [230, 230, 230],
        fillColor: [31, 41, 55], // gray-800
      },
      headStyles: {
        fillColor: [55, 65, 81], // gray-700
        textColor: 255,
      },
      alternateRowStyles: { fillColor: [45, 55, 72] }, // gray-900
      margin: { left: 40, right: 40 },

      // --- ✅ SOLUCIÓN: Usar willDrawPage para pintar el fondo ANTES ---
      willDrawPage: (data) => {
        // Solo pintamos en las páginas que autoTable crea automáticamente
        if (data.pageNumber > 1) {
          paintDarkBg(doc);
        }
      },
      
      // didDrawPage se sigue usando para el footer, que va encima de todo
      didDrawPage: () => {
        const str = `Página ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(9);
        doc.setTextColor(180);
        doc.text(
          str,
          pageWidth - 40,
          doc.internal.pageSize.getHeight() - 20,
          { align: "right" }
        );
      },
      ...opts,
    });

    y = doc.lastAutoTable.finalY + 24;

    // Tu lógica para saltos de página manuales sigue siendo correcta
    if (idx < sections.length - 1 && y > pageHeight - 160) {
      doc.addPage();
      paintDarkBg(doc); // Pinta el fondo de la nueva página manual
      y = 80;

      // Volver a dibujar el encabezado
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Analizador de Instrumentos", 40, 40);
      if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(200);
        doc.text(subtitle, 40, 58);
      }
    }
  });

  doc.save(filename);
}