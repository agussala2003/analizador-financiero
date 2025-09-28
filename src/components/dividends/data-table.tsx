import {
    flexRender,
    Table as TanstackTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import PaginationDemo from "../pagination-demo";

// La interfaz ahora usa un tipo genérico TData
interface DataTableProps<TData> {
    table: TanstackTable<TData>; // Recibe la instancia completa de la tabla
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function DataTable<TData>({
    table,
    totalPages,
    currentPage,
    onPageChange
}: DataTableProps<TData>) {

    return (
        <div className="flex flex-col gap-4">
            {/* --- TABLA --- */}
            <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                    No hay resultados que coincidan con tus filtros.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- PAGINACIÓN --- */}
            <div className="flex flex-col items-center justify-between pt-2 pb-4 gap-5">
                {totalPages > 1 && (
                     <PaginationDemo
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                )}
                <div className="text-sm text-muted-foreground text-nowrap">
                    {table.getFilteredRowModel().rows.length} resultados
                </div>
            </div>
        </div>
    );
}