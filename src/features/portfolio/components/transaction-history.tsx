import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Transaction } from "../../../types/portfolio";
import { DataTable } from "../../dividends/components/data-table";
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef } from "@tanstack/react-table";

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (value: number) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatQuantity = (value: number) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
    const columns = useMemo<ColumnDef<Transaction>[]>(() => [
        { accessorKey: "purchase_date", header: "Fecha", cell: ({ getValue }) => formatDate(getValue() as string) },
        { accessorKey: "symbol", header: "Activo" },
        { accessorKey: "transaction_type", header: "Tipo", cell: ({ getValue }) => <span className={`font-semibold ${getValue() === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{getValue() === 'buy' ? 'Compra' : 'Venta'}</span> },
        { accessorKey: "quantity", header: "Cantidad", cell: ({ getValue }) => formatQuantity(getValue() as number) },
        { accessorKey: "purchase_price", header: "Precio", cell: ({ getValue }) => formatCurrency(getValue() as number) },
        { id: "totalValue", header: "Valor Total", cell: ({ row }) => formatCurrency(row.original.quantity * row.original.purchase_price) },
    ], []);

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (transactions.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable
                    table={table}
                    totalPages={table.getPageCount()}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    onPageChange={(page) => table.setPageIndex(page - 1)}
                />
            </CardContent>
        </Card>
    );
}