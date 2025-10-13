// src/features/dividends/components/table/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../../../components/ui/button";
import { ArrowUpDown, Calculator } from "lucide-react";
import { CalculateDividendModal } from "../../../../components/ui/calculate-dividend";
import { Dialog, DialogTrigger } from "../../../../components/ui/dialog";
import { Dividend } from "../../types/dividends.types";
import { dateInRangeFilterFn, formatDateES, formatCurrency, formatPercentage, capitalizeFrequency } from "../../lib/dividends.utils";

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
        cell: ({ row }) => formatDateES(row.getValue("date")),
    },
    {
        accessorKey: "paymentDate",
        header: "Fecha de Pago",
        cell: ({ row }) => formatDateES(row.getValue("paymentDate")),
        filterFn: dateInRangeFilterFn,
    },
    {
        accessorKey: "declarationDate",
        header: "Fecha de Declaración",
        cell: ({ row }) => formatDateES(row.getValue("declarationDate")),
    },
    {
        accessorKey: "dividend",
        header: "Dividendo",
        cell: ({ row }) => formatCurrency(row.getValue("dividend")),
    },
    {
        accessorKey: "yield",
        header: "Rendimiento",
        cell: ({ row }) => formatPercentage(row.getValue("yield")),
    },
    {
        accessorKey: "frequency",
        header: "Frecuencia",
        cell: ({ row }) => (
            <span className="capitalize">{capitalizeFrequency(row.getValue("frequency"))}</span>
        ),
        filterFn: "equalsString",
    },
];