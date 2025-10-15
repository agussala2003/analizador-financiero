// src/utils/export-pdf.ts

import type { AssetData } from '../types/dashboard';
import type { Indicator, IndicatorConfig } from './financial';
// Importamos el tipo 'HookData' que necesitaremos para el hook
import type { HookData } from 'jspdf-autotable';

// --- TIPOS Y INTERFACES ---
type Theme = 'light' | 'dark' | 'system';

interface CellWithRawValue {
    content: string;
    rawValue: number | 'N/A';
}

interface PdfSection {
    title: string;
    head: string[][];
    body: (string | number | CellWithRawValue)[][];
    metricKeys?: string[];
    isCorrelation?: boolean;
}

interface ExportOptions {
    title: string;
    subtitle: string;
    sections: PdfSection[];
    assets: AssetData[];
    theme: Theme;
    indicatorConfig: IndicatorConfig;
}

interface ExtendedJsPDF {
    lastAutoTable?: {
        finalY: number;
    };
    internal: {
        pageSize: {
            width: number;
            height: number;
        };
        getNumberOfPages(): number;
    };
    setFillColor(color: string): void;
    setFillColor(r: number, g: number, b: number): void;
    rect(x: number, y: number, w: number, h: number, style: string): void;
    setFontSize(size: number): void;
    setTextColor(r: number, g: number, b: number): void;
    text(text: string, x: number, y: number, options?: { align?: string; baseline?: string }): void;
    setPage(page: number): void;
    save(fileName: string): void;
}

// --- UTILIDADES DE VALIDACIÓN ---
const safeCellToString = (cellValue: unknown): string => {
    if (cellValue === null || cellValue === undefined) return '';
    if (typeof cellValue === 'string') return cellValue;
    if (typeof cellValue === 'number') return cellValue.toString();
    if (typeof cellValue === 'boolean') return cellValue.toString();
    if (typeof cellValue === 'object' && cellValue !== null && 'content' in cellValue) {
        return safeCellToString((cellValue as { content: unknown }).content);
    }
    if (typeof cellValue === 'bigint' || typeof cellValue === 'symbol') {
        return cellValue.toString();
    }
    return '';
};

// --- LÓGICA DE ESTILOS Y FORMATO ---
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
};

const getThemeStyles = (theme: Theme) => {
    const resolvedTheme = resolveTheme(theme);
    const isDark = resolvedTheme === 'dark';
    return {
        backgroundColor: isDark ? '#1C2135' : '#FFFFFF',
        textColor: isDark ? [240, 241, 249] as [number, number, number] : [33, 41, 72] as [number, number, number],
        mutedColor: isDark ? [160, 167, 200] as [number, number, number] : [122, 130, 163] as [number, number, number],
        borderColor: isDark ? '#414A6E' : '#E1E4F2',
        headerColor: isDark ? [137, 221, 255] as [number, number, number] : [83, 104, 225] as [number, number, number],
        tableHeaderFill: isDark ? '#414A6E' : '#F1F5F9',
    };
};

const getTrafficLightColor = (config: Indicator, value: number, theme: Theme): [number, number, number] | undefined => {
    const { green, yellow, lowerIsBetter } = config;
    const resolvedTheme = resolveTheme(theme);
    const isDark = resolvedTheme === 'dark';
    const colors = {
        green: isDark ? [74, 222, 128] as [number, number, number] : [22, 163, 74] as [number, number, number],
        yellow: isDark ? [234, 179, 8] as [number, number, number] : [202, 138, 4] as [number, number, number],
        red: isDark ? [239, 68, 68] as [number, number, number] : [220, 38, 38] as [number, number, number],
    };
    if (lowerIsBetter) {
        if (value <= green) return colors.green;
        if (value <= yellow) return colors.yellow;
        return colors.red;
    } else {
        if (value >= green) return colors.green;
        if (value >= yellow) return colors.yellow;
        return colors.red;
    }
};

const getCorrelationCellStyle = (value: number) => {
    const v = Math.min(1, Math.max(0, value));
    const hue = v * 120;
    const saturation = 100;
    const lightness = 45;
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    let r: number, g: number, b: number;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { 
        fillColor: [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)] as [number, number, number],
    };
};

const getPercentageColor = (value: number, theme: Theme): [number, number, number] => {
    const resolvedTheme = resolveTheme(theme);
    const isDark = resolvedTheme === 'dark';
    if (value >= 0) {
        return isDark ? [34, 197, 94] : [22, 163, 74];
    } else {
        return isDark ? [239, 68, 68] : [220, 38, 38];
    }
};

// --- FUNCIÓN PRINCIPAL DE EXPORTACIÓN ---
export const exportToPdf = async ({ title, subtitle, sections, assets, theme, indicatorConfig }: ExportOptions) => {
    const [jsPDFModule, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF() as unknown as ExtendedJsPDF;
    const styles = getThemeStyles(theme);
    let finalY = 0;

    // Esto dibuja el fondo para la PÁGINA 1
    const resolvedTheme = resolveTheme(theme);
    if (resolvedTheme === 'dark') {
        doc.setFillColor(styles.backgroundColor);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    }

    doc.setFontSize(18);
    doc.setTextColor(styles.headerColor[0], styles.headerColor[1], styles.headerColor[2]);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(styles.mutedColor[0], styles.mutedColor[1], styles.mutedColor[2]);
    doc.text(subtitle, 14, 30);

    finalY = 35;

    sections.forEach(section => {
        if (section.body.length === 0) return;

        doc.setFontSize(12);
        doc.setTextColor(styles.textColor[0], styles.textColor[1], styles.textColor[2]);
        doc.text(section.title, 14, finalY + 10);

        const processedBody = section.body.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
                if (section.metricKeys && colIndex > 0) {
                    const metricKey = section.metricKeys[rowIndex];
                    const config = metricKey ? indicatorConfig[metricKey] : undefined;
                    if (typeof cell === 'object' && cell !== null && 'rawValue' in cell && config) {
                        const rawValue = cell.rawValue;
                        const value = typeof rawValue === 'number' ? rawValue : null;
                        if (value !== null) {
                            const color = getTrafficLightColor(config, value, theme);
                            if (color) {
                                return { content: cell.content, styles: { textColor: color } };
                            }
                        }
                        return cell.content;
                    }
                }
                
                if (section.isCorrelation && colIndex > 0) {
                    const cellValue = safeCellToString(cell);
                    const value = parseFloat(cellValue);
                    if (!isNaN(value)) {
                        const cellStyles = getCorrelationCellStyle(value);
                        return { content: cellValue, styles: { textColor: cellStyles.fillColor } };
                    }
                }
                
                if (typeof cell === 'object' && cell !== null && 'content' in cell) {
                    return cell.content;
                }
                
                const cellValue = String(cell);
                const isPercentage = cellValue.includes('%') && cellValue !== 'N/A' && cellValue !== '-';

                if (isPercentage && !section.isCorrelation && !section.metricKeys) {
                    const numericValue = parseFloat(cellValue.replace('%', ''));
                    if (!isNaN(numericValue)) {
                        const color = getPercentageColor(numericValue, theme);
                        return { content: cellValue, styles: { textColor: color } };
                    }
                }
                return cell;
            })
        );

        autoTable(doc as never, {
            startY: finalY + 15,
            head: section.head,
            body: processedBody,
            theme: 'grid',
            styles: {
                fillColor: styles.backgroundColor,
                textColor: styles.textColor,
                lineColor: styles.borderColor,
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: styles.tableHeaderFill,
                textColor: styles.textColor,
                fontStyle: 'bold',
            },
            // ==================================================================
            // INICIO DEL CÓDIGO AÑADIDO
            // ==================================================================
            willDrawPage: (data: HookData) => {
                // Este hook dibuja el fondo en CADA PÁGINA que la tabla crea.
                // No lo aplicamos a la página 1 porque ya lo hicimos manualmente.
                if (data.pageNumber > 1 && resolvedTheme === 'dark') {
                    doc.setFillColor(styles.backgroundColor);
                    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
                }
            }
            // ==================================================================
            // FIN DEL CÓDIGO AÑADIDO
            // ==================================================================
        });

        finalY = doc.lastAutoTable?.finalY ?? finalY;
    });

    // El footer se dibuja sobre el fondo correcto en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(styles.mutedColor[0], styles.mutedColor[1], styles.mutedColor[2]);
        const text = `Reporte generado por FinDash | ${new Date().toLocaleDateString('es-ES')} | Activos: ${assets.map(a => a.symbol).join(', ')}`;
        doc.text(text, 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 10);
    }

    const fileName = `${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

// --- EXPORTACIÓN ESPECÍFICA PARA PORTAFOLIO ---

/**
 * Interfaz para las estadísticas del portafolio.
 */
interface PortfolioStats {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  averageBuyPrice: number;
}

/**
 * Interfaz para un holding (posición) del portafolio.
 */
interface PortfolioHolding {
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  totalCost: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

/**
 * Opciones para exportar el portafolio a PDF.
 */
interface ExportPortfolioOptions {
  holdings: PortfolioHolding[];
  stats: PortfolioStats;
  theme: Theme;
  portfolioName?: string;
}

/**
 * Exporta el portafolio actual a un archivo PDF.
 * Incluye estadísticas generales y detalle de cada posición.
 * 
 * @example
 * ```tsx
 * exportPortfolioToPdf({
 *   holdings,
 *   stats: portfolioStats,
 *   theme: 'light'
 * });
 * ```
 */
export const exportPortfolioToPdf = async ({
  holdings,
  stats,
  theme,
  portfolioName = 'Mi Portafolio',
}: ExportPortfolioOptions) => {
  const [jsPDFModule, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const jsPDF = jsPDFModule.default;
  const doc = new jsPDF() as unknown as ExtendedJsPDF;
  const styles = getThemeStyles(theme);
  let finalY = 0;

  // Fondo de la primera página
  const resolvedTheme = resolveTheme(theme);
  if (resolvedTheme === 'dark') {
    doc.setFillColor(styles.backgroundColor);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  }

  // Título
  doc.setFontSize(20);
  doc.setTextColor(styles.headerColor[0], styles.headerColor[1], styles.headerColor[2]);
  doc.text('Reporte de Portafolio', 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(styles.mutedColor[0], styles.mutedColor[1], styles.mutedColor[2]);
  doc.text(portfolioName, 14, 30);

  finalY = 40;

  // Sección de Estadísticas Generales
  doc.setFontSize(14);
  doc.setTextColor(styles.textColor[0], styles.textColor[1], styles.textColor[2]);
  doc.text('Resumen del Portafolio', 14, finalY);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const statsBody = [
    ['Inversión Total', formatCurrency(stats.totalInvestment)],
    ['Valor Actual', formatCurrency(stats.currentValue)],
    [
      'Ganancia/Pérdida',
      `${formatCurrency(stats.totalGainLoss)} (${formatPercentage(stats.totalGainLossPercentage)})`,
    ],
    ['Precio Promedio de Compra', formatCurrency(stats.averageBuyPrice)],
  ];

  autoTable(doc as never, {
    startY: finalY + 5,
    head: [['Métrica', 'Valor']],
    body: statsBody,
    theme: 'grid',
    styles: {
      fillColor: styles.backgroundColor,
      textColor: styles.textColor,
      lineColor: styles.borderColor,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: styles.tableHeaderFill,
      textColor: styles.textColor,
      fontStyle: 'bold',
    },
    willDrawPage: (data: HookData) => {
      if (data.pageNumber > 1 && resolvedTheme === 'dark') {
        doc.setFillColor(styles.backgroundColor);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
      }
    },
  });

  finalY = doc.lastAutoTable?.finalY ?? finalY;

  // Sección de Posiciones Abiertas
  if (holdings.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(styles.textColor[0], styles.textColor[1], styles.textColor[2]);
    doc.text('Posiciones Abiertas', 14, finalY + 15);

    const holdingsBody = holdings.map((holding) => {
      const gainLossText = formatPercentage(holding.gainLossPercentage);
      const gainLossColor = getPercentageColor(holding.gainLossPercentage, theme);

      return [
        holding.symbol,
        holding.name ?? '-',
        holding.quantity.toString(),
        formatCurrency(holding.averagePrice),
        formatCurrency(holding.currentPrice ?? 0),
        formatCurrency(holding.currentValue),
        {
          content: `${formatCurrency(holding.gainLoss)} (${gainLossText})`,
          styles: { textColor: gainLossColor },
        },
      ];
    });

    autoTable(doc as never, {
      startY: finalY + 20,
      head: [
        [
          'Símbolo',
          'Nombre',
          'Cantidad',
          'Precio Prom.',
          'Precio Actual',
          'Valor Actual',
          'Ganancia/Pérdida',
        ],
      ],
      body: holdingsBody,
      theme: 'grid',
      styles: {
        fillColor: styles.backgroundColor,
        textColor: styles.textColor,
        lineColor: styles.borderColor,
        lineWidth: 0.1,
        fontSize: 9,
      },
      headStyles: {
        fillColor: styles.tableHeaderFill,
        textColor: styles.textColor,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 35 },
      },
      willDrawPage: (data: HookData) => {
        if (data.pageNumber > 1 && resolvedTheme === 'dark') {
          doc.setFillColor(styles.backgroundColor);
          doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
        }
      },
    });

    finalY = doc.lastAutoTable?.finalY ?? finalY;
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(styles.mutedColor[0], styles.mutedColor[1], styles.mutedColor[2]);
    const text = `Reporte generado por FinDash | ${new Date().toLocaleDateString('es-ES')}`;
    doc.text(text, 14, doc.internal.pageSize.height - 10);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 35,
      doc.internal.pageSize.height - 10
    );
  }

  const fileName = `Portafolio_${portfolioName.replace(/\s/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  doc.save(fileName);
};