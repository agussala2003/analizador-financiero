import React, { useMemo } from "react";
import { AssetData } from "../../../types/dashboard";
import { correlation } from "../../../utils/math";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { Download, GitCompareArrows } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";

// --- Props del Componente ---
interface CorrelationMatrixProps {
    assets: AssetData[];
}

// --- Lógica de Estilo para Celdas ---
const getCellStyle = (value: number | null): React.CSSProperties => {
  if (typeof value !== "number" || !isFinite(value)) {
    return {
      backgroundColor: "hsl(var(--muted))",
      color: "hsl(var(--muted-foreground))",
    };
  }

  // Clampear el valor entre 0 y 1
  const v = Math.min(1, Math.max(0, value));

  // Rojo (0, 100%, 50%) -> Amarillo (60, 100%, 50%) -> Verde (120, 100%, 40%)
  let hue: number;
  if (v <= 0.5) {
    // De rojo (0) a amarillo (60)
    hue = 0 + (v / 0.5) * 60;
  } else {
    // De amarillo (60) a verde (120)
    hue = 60 + ((v - 0.5) / 0.5) * 60;
  }

  const saturation = 90;
  const lightness = 55;

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: `hsl(${hue}, 100%, 15%)`,
  };
};

// --- Componente Principal ---
export const CorrelationMatrix = React.memo(function CorrelationMatrix({ assets }: CorrelationMatrixProps) {
    const correlationMatrix = useMemo(() => {
        const matrix: (number | null)[][] = [];
        if (assets.length < 2) return [];

        for (let i = 0; i < assets.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < assets.length; j++) {
                if (i === j) {
                    matrix[i][j] = 1;
                } else {
                    const returnsA = assets[i].historicalReturns;
                    const returnsB = assets[j].historicalReturns;
                    if (returnsA?.length > 1 && returnsB?.length > 1) {
                        matrix[i][j] = correlation(returnsA, returnsB);
                    } else {
                        matrix[i][j] = null;
                    }
                }
            }
        }
        return matrix;
    }, [assets]);

    if (assets.length < 2) {
        return (
            <Card className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                    <GitCompareArrows className="w-10 h-10 mx-auto mb-3" />
                    <p className="font-semibold">Necesitas al menos 2 activos</p>
                    <p className="text-sm mt-1">Añade otro activo para calcular la correlación.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
                <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                    <GitCompareArrows className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Matriz de Correlación</CardTitle>
                        <CardDescription>
                            Cómo se mueven los precios de tus activos entre sí (1: juntos, -1: opuestos).
                        </CardDescription>
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
                            <DropdownMenuItem>Exportar a PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                    <Table className="min-w-full">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="sticky left-0 z-10 bg-muted/50 font-semibold">Activo</TableHead>
                                {assets.map(asset => (
                                    <TableHead key={asset.symbol} className="text-center font-semibold">{asset.symbol}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((rowAsset, i) => (
                                <TableRow key={rowAsset.symbol}>
                                    <TableHead className="font-bold sticky left-0 z-10 bg-background">{rowAsset.symbol}</TableHead>
                                    {assets.map((colAsset, j) => {
                                        const value = correlationMatrix[i]?.[j];
                                        return (
                                            <TableCell key={colAsset.symbol} className="text-center font-bold p-1">
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className="w-full h-10 flex items-center justify-center rounded-md text-sm"
                                                                style={getCellStyle(value)}
                                                            >
                                                                {typeof value === 'number' ? value.toFixed(2) : 'N/A'}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Correlación: {rowAsset.symbol} y {colAsset.symbol}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
});