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
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { usePrefetchAsset } from "../../../../hooks/use-prefetch-asset";
import { usePlanFeature } from "../../../../hooks/use-plan-feature";
import { useAssetFreshness } from "../../hooks/use-asset-freshness";
import { AssetFreshnessBadge } from "../../../../components/ui/asset-freshness-badge";

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
    sortKey: keyof AssetData | 'symbol';
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
    const { prefetchAssetIfNotCached } = usePrefetchAsset();
    const { hasAccess: canExportPdf, upgradeMessage } = usePlanFeature('exportPdf');

    // Hook para obtener frescura de datos por activo
    const symbols = useMemo(() => assets.map(a => a.symbol), [assets]);
    const { freshnessMap } = useAssetFreshness(symbols);

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

        void exportToPdf({
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
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            <div>
                                <CardTitle className="text-lg sm:text-xl">Precios y Volatilidad</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Análisis de rendimiento y riesgo de los activos.</CardDescription>
                            </div>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto text-xs sm:text-sm"
                                                disabled={!canExportPdf}
                                            >
                                                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
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
                            </TooltipTrigger>
                            {!canExportPdf && (
                                <TooltipContent>
                                    <p className="text-xs">{upgradeMessage}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
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
                                        <SortableTableHeader sortKey="lastMonthAvgPriceTarget" currentSort={sort} onSort={handleSort} align="center">Precio Objetivo</SortableTableHeader>
                                        <TableHead className="text-center w-[100px]">
                                            Comprar
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAssets.map((asset) => (
                                        <TableRow key={asset.symbol}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    to={`/asset/${asset.symbol}`}
                                                    className="flex items-center gap-3 group"
                                                    onMouseEnter={() => prefetchAssetIfNotCached(asset.symbol)}
                                                    onFocus={() => prefetchAssetIfNotCached(asset.symbol)}
                                                >
                                                    <img src={asset.image} alt={asset.companyName} className="w-8 h-8 rounded-full bg-muted object-contain border" />
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold group-hover:text-primary transition-colors">{asset.symbol}</div>
                                                                <div className="caption text-muted-foreground truncate max-w-[180px]">{asset.companyName}</div>
                                                            </div>
                                                            <AssetFreshnessBadge lastUpdated={freshnessMap.get(asset.symbol) ?? null} size="xs" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{formatCurrency(asset.currentPrice)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.dayChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.monthChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.yearChange)}</TableCell>
                                            <TableCell className="text-center">{pctNode(asset.stdDev)}</TableCell>
                                            <TableCell className="text-center font-semibold">{formatNumber(asset.sharpeRatio)}</TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {typeof asset.lastMonthAvgPriceTarget === 'number' && asset.lastMonthAvgPriceTarget > 0
                                                    ? formatCurrency(asset.lastMonthAvgPriceTarget)
                                                    : <span className="text-muted-foreground text-xs font-normal">N/A</span>}
                                            </TableCell>
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
                    <div className="sm:hidden grid grid-cols-1 gap-3">
                        {sortedAssets.map(asset => (
                            <Card key={asset.symbol} className="p-3">
                                <div className="flex items-start justify-between mb-3">
                                    <Link
                                        to={`/asset/${asset.symbol}`}
                                        className="flex items-center gap-2 font-bold flex-1 min-w-0"
                                        onMouseEnter={() => prefetchAssetIfNotCached(asset.symbol)}
                                        onFocus={() => prefetchAssetIfNotCached(asset.symbol)}
                                    >
                                        <img src={asset.image} alt={asset.companyName} className="w-7 h-7 rounded-full bg-muted object-contain border flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm flex items-center gap-1.5">
                                                {asset.symbol}
                                                <AssetFreshnessBadge lastUpdated={freshnessMap.get(asset.symbol) ?? null} size="xs" />
                                            </div>
                                            <div className="text-xs text-muted-foreground font-normal truncate">{asset.companyName}</div>
                                        </div>
                                    </Link>
                                    <span className="font-semibold text-base flex-shrink-0 ml-2">{formatCurrency(asset.currentPrice)}</span>
                                </div>
                                <div className="space-y-1.5 text-xs border-t pt-2.5 mt-2.5">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Diaria</span>{pctNode(asset.dayChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Mensual</span>{pctNode(asset.monthChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Var. Anual</span>{pctNode(asset.yearChange)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Volatilidad</span>{pctNode(asset.stdDev)}</div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Ratio Sharpe</span><span className="font-semibold">{formatNumber(asset.sharpeRatio)}</span></div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Precio Objetivo</span>
                                        <span className="font-semibold">
                                            {typeof asset.lastMonthAvgPriceTarget === 'number' && asset.lastMonthAvgPriceTarget > 0
                                                ? formatCurrency(asset.lastMonthAvgPriceTarget)
                                                : <span className="text-muted-foreground text-xs font-normal">N/A</span>}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2.5 text-xs"
                                    onClick={() => setBuyModalInfo({ isOpen: true, ticker: asset.symbol, price: asset.currentPrice })}
                                >
                                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                                    Comprar
                                </Button>
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
