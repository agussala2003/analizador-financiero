// src/utils/export-pdf.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssetData } from '../types/dashboard';
import { Indicator, IndicatorConfig } from './financial';

// --- TIPOS Y INTERFACES ---
type Theme = 'light' | 'dark' | 'system';

interface PdfSection {
    title: string;
    head: string[][];
    body: (string | number)[][];
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

// Extended jsPDF interface to include autoTable properties
interface ExtendedJsPDF extends jsPDF {
    lastAutoTable?: {
        finalY: number;
    };
    internal: jsPDF['internal'] & {
        getNumberOfPages(): number;
    };
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
    // Only use String() as last resort for primitive types
    if (typeof cellValue === 'bigint' || typeof cellValue === 'symbol') {
        return cellValue.toString();
    }
    // For objects without a content property, return empty string to avoid [object Object]
    return '';
};

// --- LÓGICA DE ESTILOS Y FORMATO (Funciones internas del módulo) ---
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
        green: isDark ? [74, 222, 128] as [number, number, number] : [22, 163, 74] as [number, number, number],   // text-green-400 / text-green-600
        yellow: isDark ? [234, 179, 8] as [number, number, number] : [202, 138, 4] as [number, number, number],    // text-yellow-500 / text-yellow-600
        red: isDark ? [239, 68, 68] as [number, number, number] : [220, 38, 38] as [number, number, number],        // text-red-500 / text-red-600
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

    const negColor = { h: 0, s: 90, l: 55 };
    const midColor = { h: 60, s: 25, l: 97 };
    const posColor = { h: 120, s: 80, l: 45 };
    let h, s, l;

    if (value < 0) {
        const t = Math.abs(value);
        h = midColor.h + (negColor.h - midColor.h) * t;
        s = midColor.s + (negColor.s - midColor.s) * t;
        l = midColor.l + (negColor.l - midColor.l) * t;
    } else {
        const t = value;
        h = midColor.h + (posColor.h - midColor.h) * t;
        s = midColor.s + (posColor.s - midColor.s) * t;
        l = midColor.l + (posColor.l - midColor.l) * t;
    }
    const textColor: [number, number, number] = l > 75 ? [10, 10, 10] : [253, 253, 253];
    return { fillColor: `hsl(${h}, ${s}%, ${l}%)`, textColor };
};

const getPercentageColor = (value: number, theme: Theme): [number, number, number] => {

    const resolvedTheme = resolveTheme(theme);
    const isDark = resolvedTheme === 'dark';
    if (value >= 0) {
        // Colores más vibrantes para mejor visibilidad en PDF
        return isDark ? [34, 197, 94] : [22, 163, 74]; // text-green-500 / text-green-600
    } else {
        return isDark ? [239, 68, 68] : [220, 38, 38]; // text-red-500 / text-red-600
    }
};

// --- FUNCIÓN PRINCIPAL DE EXPORTACIÓN ---
export const exportToPdf = ({ title, subtitle, sections, assets, theme, indicatorConfig }: ExportOptions) => {
    const doc = new jsPDF() as ExtendedJsPDF;
    const styles = getThemeStyles(theme);
    let finalY = 0;

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

        // Procesar el cuerpo de la tabla para añadir estilos de color
        const processedBody = section.body.map(row =>
            row.map(cell => {
                const cellValue = String(cell);
                const isPercentage = cellValue.includes('%') && cellValue !== 'N/A' && cellValue !== '-';

                if (isPercentage && !section.isCorrelation && !section.metricKeys) {
                    const numericValue = parseFloat(cellValue.replace('%', ''));
                    if (!isNaN(numericValue)) {
                        const color = getPercentageColor(numericValue, theme);
                        return {
                            content: cellValue,
                            styles: { textColor: color }
                        };
                    }
                }
                return cell;
            })
        );

        autoTable(doc, {
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
            willDrawCell: (data) => {
                // Estilos para la Tabla de Fundamentales con indicadores específicos
                if (section.metricKeys && data.section === 'body' && data.column.index > 0) {
                    const metricKey = section.metricKeys[data.row.index];
                    const config = indicatorConfig[metricKey];
                    const valueStr = safeCellToString(data.cell.raw).replace('%', '').replace('$', '');
                    const value = parseFloat(valueStr);

                    if (config && !isNaN(value)) {
                        const color = getTrafficLightColor(config, value, theme);
                        if (color) {
                            data.cell.styles.textColor = color;
                        }
                    }
                }
            },
            didDrawCell: (data) => {
                // Estilos para la Matriz de Correlación
                if (section.isCorrelation && data.section === 'body' && data.column.index > 0) {
                    const valueStr = safeCellToString(data.cell.raw);
                    const value = parseFloat(valueStr);
                    if (!isNaN(value)) {
                        const cellStyles = getCorrelationCellStyle(value);
                        doc.setFillColor(cellStyles.fillColor);
                        doc.setTextColor(...cellStyles.textColor);
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        doc.text(safeCellToString(data.cell.raw), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
                            align: 'center', baseline: 'middle'
                        });
                    }
                }
            }
        });

        finalY = doc.lastAutoTable?.finalY ?? finalY;
    });

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