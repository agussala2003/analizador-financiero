import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, Calculator } from "lucide-react";
import { CalculateDividendModal } from "../calculate-dividend";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DateRange } from "react-day-picker";

export interface Dividend {
    symbol: string;
    date: string;
    recordDate: string;
    paymentDate: string;
    declarationDate: string;
    adjDividend: number;
    dividend: number;
    yield: number;
    frequency: string;
};

// --- FUNCIÓN DE FILTRO ACTUALIZADA PARA RANGO DE FECHAS ---
const dateInRangeFilterFn: FilterFn<Dividend> = (row: Row<Dividend>, columnId: string, filterValue: DateRange) => {
    if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true;
    }

    const rowDate = new Date(row.getValue(columnId));
    if (isNaN(rowDate.getTime())) return false;

    const { from, to } = filterValue;

    // Ajustamos 'to' para que incluya todo el día.
    const toDate = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : null;

    if (from && toDate) {
        return rowDate >= from && rowDate <= toDate;
    }
    if (from) {
        return rowDate >= from;
    }
    if (toDate) {
        return rowDate <= toDate;
    }
    return true;
};

export const columns: ColumnDef<Dividend>[] = [
    {
        accessorKey: "symbol",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Instrumento <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
        ),
        cell: ({ row }) => {
            // ... (código de la celda sin cambios)
            const dividendData = row.original;
            return (
                <div className="flex items-center gap-2 pl-3 font-medium">
                    <span>{dividendData.symbol}</span>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" title="Calcular dividendo">
                                <Calculator className="w-4 h-4 text-primary" />
                            </Button>
                        </DialogTrigger>
                        <CalculateDividendModal dividend={dividendData} />
                    </Dialog>
                </div>
            );
        },
    },
    {
        accessorKey: "date",
        header: "Fecha Ex-Dividendo",
        cell: ({ row }) => {
            const value = row.getValue("date");
            const date = value instanceof Date ? value : new Date(value as string | number);
            return isNaN(date.getTime()) ? <span>-</span> : date.toLocaleDateString("es-ES");
        },
    },
    {
        accessorKey: "paymentDate",
        header: "Fecha de Pago",
        cell: ({ row }) => {
            const value = row.getValue("paymentDate");
            const date = value instanceof Date ? value : new Date(value as string | number);
            return isNaN(date.getTime()) ? <span>-</span> : date.toLocaleDateString("es-ES");
        },
        filterFn: dateInRangeFilterFn, // Aplicamos el filtro de rango
    },
    {
        accessorKey: "declarationDate",
        header: "Fecha de Declaración",
        cell: ({ row }) => {
            const value = row.getValue("declarationDate");
            const date = value instanceof Date ? value : new Date(value as string | number);
            return isNaN(date.getTime()) ? <span>-</span> : date.toLocaleDateString("es-ES");
        },
    },
    {
        accessorKey: "dividend",
        header: "Dividendo",
        cell: ({ row }) => {
            const dividend = row.getValue("dividend");
            return typeof dividend === 'number' && !isNaN(dividend) ? `$${dividend.toFixed(2)}` : <span>-</span>;
        },
    },
    {
        accessorKey: "yield",
        header: "Rendimiento",
        cell: ({ row }) => {
            const yieldValue = row.getValue("yield");
            return typeof yieldValue === 'number' && !isNaN(yieldValue) ? `${yieldValue.toFixed(2)}%` : <span>-</span>;
        },
    },
    {
        accessorKey: "frequency",
        header: "Frecuencia",
        cell: ({ row }) => {
            const frequency = row.getValue("frequency");
            return <span className="capitalize">{typeof frequency === 'string' && frequency ? frequency.toLowerCase() : '-'}</span>;
        },
        filterFn: "equalsString",
    },
];