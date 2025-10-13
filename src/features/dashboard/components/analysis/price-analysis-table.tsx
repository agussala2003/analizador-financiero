import React, { useMemo, useState } from "react";
import { AssetData } from "../../../../types/dashboard";
import { Button } from "../../../../components/ui/button";
import { ArrowDown, ArrowUp, Download, BarChart2, ShoppingCart } from "lucide-react";
import { exportToPdf } from "../../../../utils/export-pdf";
import { indicatorConfig } from "../../../../utils/financial";
import { useTheme } from "../../../../components/ui/theme-provider";
import { Link } from "react-router-dom";
import { AddTransactionModal } from "../../../portfolio/components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";

// --- Props del Componente ---
interface PriceAnalysisTableProps {
    assets: AssetData[];
}

// --- Funciones de Formato ---
const formatCurrency = (v: number | 'N/A') => (typeof v === "number" && v !== 0 ? `$${v.toFixed(2)}` : "-");
const formatNumber = (v: number | 'N/A') => (typeof v === "number" && v !== 0 ? v.toFixed(2) : "-");
const pctNode = (v: number | 'N/A') => {
    if (typeof v !== "number") return <span className="text-muted-foreground">-</span>;
    const color = v >= 0 ? "text-green-500" : "text-red-500";
    const Icon = v >= 0 ? ArrowUp : ArrowDown;
    return (
        <span className={`flex items-center justify-center gap-1 font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {v.toFixed(2)}%
        </span>
    );
};

// --- Componente de Cabecera Ordenable ---
const SortableTableHeader = ({
    children,
    align = 'left',
    sortKey,
    currentSort,
    onSort
}: {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
    sortKey: keyof AssetData | 'symbol' | 'currentPrice' | 'dayChange' | 'monthChange' | 'yearChange' | 'stdDev' | 'sharpeRatio' | 'targetPrice';
    currentSort: { key: string; dir: 'asc' | 'desc' };
    onSort: (key: string) => void;
}) => {
    const isActive = currentSort.key === sortKey;
    const Icon = currentSort.dir === 'asc' ? ArrowUp : ArrowDown;

    return (
        <TableHead className={`text-${align} w-[150px]`}>
            <Button variant="ghost" onClick={() => onSort(sortKey)} className={`w-full justify-${sortKey === 'symbol' ? 'start' : 'center'} h-8`}>
                {children}
                <Icon className={`w-4 h-4 ml-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`} />
            </Button>
        </TableHead>
    );
};

// --- Componente Principal ---
export const PriceAnalysisTable = React.memo(function PriceAnalysisTable({ assets }: PriceAnalysisTableProps) {
    const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: "symbol", dir: "asc" });
    const { theme } = useTheme();
    const [buyModalInfo, setBuyModalInfo] = useState({ isOpen: false, ticker: null as string | null, price: null as number | null });

    const sortedAssets = useMemo(() => {
        return [...assets].sort((a, b) => {
            const valA = a[sort.key as keyof AssetData] ?? (sort.dir === 'asc' ? Infinity : -Infinity);
            const valB = b[sort.key as keyof AssetData] ?? (sort.dir === 'asc' ? Infinity : -Infinity);

            if (sort.key === 'symbol') {
                return sort.dir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
            }

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sort.dir === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });
    }, [assets, sort]);

    const handleSort = (key: string) => {
        setSort(prev => ({
            key,
            dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc"
        }));
    };

    const handlePdfExport = () => {
        const title = "Análisis de Precios y Volatilidad";
        const head = [['Activo', 'Precio', 'Var. Diaria', 'Var. Mensual', 'Var. Anual', 'Volatilidad', 'Ratio Sharpe', 'Precio Objetivo']];
        const body = sortedAssets.map(asset => [
            asset.symbol,
            formatCurrency(asset.currentPrice),
            typeof asset.dayChange === 'number' ? `${asset.dayChange.toFixed(2)}%` : 'N/A',
            typeof asset.monthChange === 'number' ? `${asset.monthChange.toFixed(2)}%` : 'N/A',
            typeof asset.yearChange === 'number' ? `${asset.yearChange.toFixed(2)}%` : 'N/A',
            typeof asset.stdDev === 'number' ? `${asset.stdDev.toFixed(2)}%` : 'N/A',
            formatNumber(asset.sharpeRatio),
            formatCurrency(asset.lastMonthAvgPriceTarget)
        ]);

        exportToPdf({
            title,
            subtitle: "Análisis de rendimiento y riesgo de los activos seleccionados.",
            sections: [{
                title: 'Tabla de Precios',
                head,
                body
            }],
            assets,
            theme: theme, // Usa el tema actual del sistema
            indicatorConfig: indicatorConfig, // Se pasa la configuración
        });
    };

    if (assets.length === 0) return null;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <BarChart2 className="w-6 h-6 text-primary" />
                            <div>
                                <CardTitle>Precios y Volatilidad</CardTitle>
                                <CardDescription>Análisis de rendimiento y riesgo de los activos.</CardDescription>
                            </div>
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
                </CardHeader>
                <CardContent>
                    {/* --- Vista de Tabla para Escritorio --- */}
                    <div className="hidden sm:block">
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <SortableTableHeader sortKey="symbol" currentSort={sort} onSort={handleSort}>Activo</SortableTableHeader>
                                        <SortableTableHeader sortKey="currentPrice" currentSort={sort} onSort={handleSort} align="center">Precio</SortableTableHeader>
                                        <SortableTableHeader sortKey="dayChange" currentSort={sort} onSort={handleSort} align="center">Var. Diaria</SortableTableHeader>
                                        <SortableTableHeader sortKey="monthChange" currentSort={sort} onSort={handleSort} align="center">Var. Mensual</SortableTableHeader>
                                        <SortableTableHeader sortKey="yearChange" currentSort={sort} onSort={handleSort} align="center">Var. Anual</SortableTableHeader>
                                        <SortableTableHeader sortKey="stdDev" currentSort={sort} onSort={handleSort} align="center">Volatilidad</SortableTableHeader>
                                        <SortableTableHeader sortKey="sharpeRatio" currentSort={sort} onSort={handleSort} align="center">Ratio Sharpe</SortableTableHeader>
                                        <SortableTableHeader sortKey="targetPrice" currentSort={sort} onSort={handleSort} align="center">Precio Objetivo</SortableTableHeader>
                                        <TableHead className="text-center w-[100px]">
                                            Comprar
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAssets.map((asset) => (
                                        <TableRow key={asset.symbol}>
                                            <TableCell className="font-medium">
                                                {/* V V V INICIO DEL CAMBIO V V V */}
                                                <Link to={`/asset/${asset.symbol}`} className="flex items-center gap-3 group">
                                                    <img src={asset.image} alt={asset.companyName} className="w-8 h-8 rounded-full bg-muted object-contain border" />
                                                    <div>
                                                        <div className="font-bold group-hover:text-primary transition-colors">{asset.symbol}</div>
                                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{asset.companyName}</div>
                                                    </div>
                                                </Link>
                                                {/* ^ ^ ^ FIN DEL CAMBIO ^ ^ ^ */}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{formatCurrency(asset.currentPrice)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.dayChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.monthChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.yearChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.stdDev)}</TableCell>
                                            <TableCell className="text-center font-semibold">{formatNumber(asset.sharpeRatio)}</TableCell>
                                            <TableCell className="text-center font-semibold">{formatCurrency(asset.lastMonthAvgPriceTarget)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setBuyModalInfo({ isOpen: true, ticker: asset.symbol, price: asset.currentPrice })}
                                                >
                                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    {/* --- Vista de Tarjetas para Móvil --- */}
                    <div className="sm:hidden grid grid-cols-1 gap-4">
                        {sortedAssets.map(asset => (
                            <Card key={asset.symbol} className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 font-bold">
                                        <img src={asset.image} alt={asset.companyName} className="w-8 h-8 rounded-full bg-muted object-contain border" />
                                        <div>
                                            <div>{asset.symbol}</div>
                                            <div className="text-xs text-muted-foreground font-normal truncate max-w-[150px]">{asset.companyName}</div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-lg">{formatCurrency(asset.currentPrice)}</span>
                                </div>
                                <div className="space-y-2 text-sm border-t pt-3 mt-3">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Diaria</span>{pctNode(asset.dayChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Mensual</span>{pctNode(asset.monthChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Anual</span>{pctNode(asset.yearChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Volatilidad</span>{pctNode(asset.stdDev)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Ratio Sharpe</span><span className="font-semibold">{formatNumber(asset.sharpeRatio)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Precio Objetivo</span><span className="font-semibold">{formatCurrency(asset.lastMonthAvgPriceTarget)}</span></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <AddTransactionModal
                isOpen={buyModalInfo.isOpen}
                onClose={() => setBuyModalInfo({ isOpen: false, ticker: null, price: null })}
                ticker={buyModalInfo.ticker}
                currentPrice={buyModalInfo.price}
            />
        </>
    );
});
