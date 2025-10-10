import React, { useMemo, useState } from "react";
import { AssetData } from "../../../types/dashboard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { Download, HelpCircle, LayoutGrid } from "lucide-react";
import { Indicator, indicatorConfig } from "../../../utils/financial";
import { exportToPdf } from "../../../utils/export-pdf";
import { useTheme } from "../../../components/ui/theme-provider";

// --- Props del Componente ---
interface FundamentalsTableProps {
    assets: AssetData[];
}

// --- Estructura para las Secciones ---
const indicatorSections = [
  {
    id: "valuation",
    title: "Métricas de Valoración",
    subtitle: "Ratios para medir la valoración relativa de la empresa.",
    keys: ["PER", "priceToBook", "priceToSales", "pfc_ratio", "evToEbitda", "evToSales", "earningsYield", "grahamNumber", "marketCap"],
  },
  {
    id: "profitability",
    title: "Rentabilidad y Márgenes",
    subtitle: "Eficiencia de la empresa para generar beneficios.",
    keys: ["grossMargin", "operatingMargin", "roe", "roa", "roic", "rdToRevenue"],
  },
  {
    id: "financialHealth",
    title: "Salud Financiera y Liquidez",
    subtitle: "Niveles de deuda y capacidad de pago a corto plazo.",
    keys: ["debtToEquity", "netDebtToEBITDA", "debt_to_assets", "currentRatio", "cashConversionCycle", "dso", "dio", "incomeQualityTTM"],
  },
  {
    id: "technical",
    title: "Indicadores Técnicos y de Mercado",
    subtitle: "Volatilidad, momentum y sentimiento del mercado.",
    keys: ["beta", "relativeVolume", "rsi14", "sma50", "sma200", "smaSignal", "dist52wHigh", "dist52wLow"],
  },
];

// --- Funciones de Formato y Estilo ---
const formatValue = (config: Indicator, value: number | 'N/A') => {
    if (typeof value !== 'number') return "N/A";
    if (config.isLargeNumber) {
        if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
        if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
        return `${(value / 1e6).toFixed(2)}M`;
    }
    if (config.asPercent) return `${value.toFixed(2)}%`;
    return value.toFixed(2);
};

const getTrafficLightClass = (config: Indicator, value: number | 'N/A'): string => {
    if (typeof value !== 'number') return "text-muted-foreground";
    const { green, yellow, lowerIsBetter } = config;
    if (lowerIsBetter) {
        if (value <= green) return 'text-green-600 dark:text-green-400';
        if (value <= yellow) return 'text-yellow-600 dark:text-yellow-500';
        return 'text-red-600 dark:text-red-500';
    } else {
        if (value >= green) return 'text-green-600 dark:text-green-400';
        if (value >= yellow) return 'text-yellow-600 dark:text-yellow-500';
        return 'text-red-600 dark:text-red-500';
    }
};

// --- Componente Principal ---
export const FundamentalsTable = React.memo(function FundamentalsTable({ assets }: FundamentalsTableProps) {
    const [hideNA, setHideNA] = useState(true);
    const [openSections, setOpenSections] = useState<string[]>(["valuation"]);
    const { theme } = useTheme();

    const visibleKeysBySection = useMemo(() => {
        const visible: Record<string, string[]> = {};
        indicatorSections.forEach(section => {
            visible[section.id] = section.keys.filter(key => 
                !hideNA || assets.some(asset => typeof asset.data?.[key] === 'number')
            );
        });
        return visible;
    }, [assets, hideNA]);

    const handlePdfExport = () => {
        const title = "Indicadores Fundamentales";
        const subtitle = "Comparativa detallada de los indicadores clave de los activos seleccionados.";
        
        // Crear secciones para cada categoría de indicadores
        const sections = indicatorSections
            .filter(section => visibleKeysBySection[section.id].length > 0)
            .map(section => {
                // Crear cabecera de la tabla
                const head = [['Indicador', ...assets.map(asset => asset.symbol)]];
                
                // Crear cuerpo de la tabla con los indicadores de esta sección
                const body = visibleKeysBySection[section.id]
                    .map(key => {
                        const config = indicatorConfig[key as keyof typeof indicatorConfig];
                        if (!config) return null;
                        
                        return [
                            config.label,
                            ...assets.map(asset => {
                                const value = asset.data?.[key];
                                return formatValue(config, value);
                            })
                        ];
                    })
                    .filter(row => row !== null);
                
                // Crear array con las claves de métricas para aplicar colores de semáforo
                const metricKeys = visibleKeysBySection[section.id].filter(key => 
                    indicatorConfig[key as keyof typeof indicatorConfig]
                );
                
                return {
                    title: `${section.title} - ${section.subtitle}`,
                    head,
                    body,
                    metricKeys // Esto activará el sistema de colores semáforo
                };
            });

        exportToPdf({
            title,
            subtitle,
            sections,
            assets,
            theme: theme,
            indicatorConfig: indicatorConfig,
        });
    };

    if (assets.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                     <div className="flex items-center gap-3">
                        <LayoutGrid className="w-6 h-6 text-primary" />
                         <div>
                            <CardTitle>Indicadores Fundamentales</CardTitle>
                            <CardDescription>Comparativa detallada de los indicadores clave.</CardDescription>
                         </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="hideNA" checked={hideNA} onCheckedChange={(checked: boolean) => setHideNA(!!checked)} />
                            <label htmlFor="hideNA" className="text-sm font-medium leading-none">Ocultar N/A</label>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {/* <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
                                <DropdownMenuItem>Exportar a Excel</DropdownMenuItem> */}
                                <DropdownMenuItem onClick={handlePdfExport}>Exportar a PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
                    {indicatorSections.map(section => (
                        visibleKeysBySection[section.id].length > 0 && (
                            <AccordionItem value={section.id} key={section.id}>
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    {section.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="overflow-x-auto border rounded-lg">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead className="w-[200px] font-semibold">Indicador</TableHead>
                                                    {assets.map(asset => <TableHead key={asset.symbol} className="text-center font-semibold">{asset.symbol}</TableHead>)}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {visibleKeysBySection[section.id].map(key => {
                                                    const config = indicatorConfig[key as keyof typeof indicatorConfig];
                                                    if (!config) return null;

                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{config.label}</span>
                                                                    <TooltipProvider delayDuration={0}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <button><HelpCircle className="w-4 h-4 text-muted-foreground" /></button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="max-w-xs">
                                                                                <p>{config.explanation}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                            </TableCell>
                                                            {assets.map(asset => (
                                                                <TableCell key={asset.symbol} className={`text-center font-semibold ${getTrafficLightClass(config, asset.data?.[key])}`}>
                                                                    {formatValue(config, asset.data?.[key])}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
});