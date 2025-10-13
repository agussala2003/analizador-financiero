// src/features/dividends/components/table/data-table-virtualized.tsx

import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../components/ui/table";
import { DataTableProps } from "../../types/dividends.types";

/**
 * Virtualized DataTable Component
 * 
 * Renderiza solo las filas visibles en el viewport usando @tanstack/react-virtual.
 * Ideal para datasets grandes (>100 rows) donde la paginación no es deseable.
 * 
 * Performance:
 * - Solo renderiza ~20 elementos DOM vs todos los registros
 * - Smooth scroll con 1000+ rows
 * - Memoria constante O(viewport) vs O(n)
 * 
 * @example
 * ```tsx
 * <DataTableVirtualized
 *   table={table}
 *   estimateSize={60} // altura estimada de cada fila en px
 * />
 * ```
 */
export function DataTableVirtualized<TData>({
    table,
    estimateSize = 60, // altura por defecto de cada fila
}: Omit<DataTableProps<TData>, 'totalPages' | 'currentPage' | 'onPageChange'> & {
    estimateSize?: number;
}) {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // IMPORTANTE: usar getFilteredRowModel() para incluir TODAS las filas filtradas (sin paginación)
    const { rows } = table.getFilteredRowModel();

    // Configuración del virtualizer
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateSize,
        overscan: 5, // elementos extra arriba/abajo para smooth scroll
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    // Padding para mantener el scroll height correcto
    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;
    const paddingBottom = virtualRows.length > 0 
        ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) 
        : 0;

    return (
        <div className="flex flex-col gap-4">
            {/* --- CONTENEDOR CON ALTURA ADAPTATIVA Y SCROLL --- */}
            <div
                ref={tableContainerRef}
                className="overflow-auto border rounded-md"
                style={{
                    height: "calc(100vh - 400px)", // altura adaptativa basada en viewport
                    minHeight: "400px", // altura mínima
                    maxHeight: "700px", // altura máxima
                    contain: "strict", // optimización de rendering
                }}
            >
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card border-b shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {virtualRows.length > 0 ? (
                            virtualRows.map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                if (!row) return null;
                                
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        data-index={virtualRow.index}
                                        ref={(node) => rowVirtualizer.measureElement(node)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center"
                                >
                                    No hay resultados que coincidan con tus filtros.
                                </TableCell>
                            </TableRow>
                        )}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- INFO DE RESULTADOS --- */}
            <div className="flex items-center justify-center pt-2 pb-4">
                <div className="text-sm text-muted-foreground">
                    {rows.length} resultado{rows.length !== 1 ? 's' : ''}
                    {rows.length > 20 && (
                        <span className="ml-2 text-xs opacity-60">
                            • Scroll virtual activo
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
