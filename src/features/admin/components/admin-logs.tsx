import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import { AdminLog } from "../../../types/admin";
import { DataTable } from '../../dividends/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { useDebounce } from "../../../hooks/use-debounce";

// --- Modal para ver Metadatos ---

interface LogMetadataModalProps {
  log: AdminLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const LogMetadataModal = ({ log, isOpen, onClose }: LogMetadataModalProps) => {
    if (!log) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Metadatos del Log #{log.id}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 bg-muted/50 p-4 rounded-md max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Página de Gestión de Logs ---
export function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

    const debouncedFilter = useDebounce(filter, 300);
    
    const [viewingLog, setViewingLog] = useState<AdminLog | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                let query = supabase.from('logs').select('*');
                if (levelFilter) {
                    query = query.eq('level', levelFilter);
                }
                const { data, error }: { data: AdminLog[] | null, error: unknown } = await query.order('created_at', { ascending: false }).limit(1000);
                if (error) {
                    let errorMsg: string;
                    if (typeof error === 'object' && error !== null) {
                        try {
                            errorMsg = JSON.stringify(error);
                        } catch {
                            errorMsg = 'Unknown error';
                        }
                    } else {
                        errorMsg = 'Unknown error';
                    }
                    throw (error instanceof Error ? error : new Error(errorMsg));
                }
                setLogs(data ?? []);
            } catch (err: unknown) {
                const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
                toast.error("Error al cargar los logs.", { description: message });
            } finally {
                setLoading(false);
            }
        };
        void fetchLogs();
    }, [levelFilter]);

    const getLevelVariant = (level: string): "destructive" | "secondary" | "outline" | "default" => {
        switch (level?.toUpperCase()) {
            case 'ERROR': return 'destructive';
            case 'WARN': return 'secondary';
            default: return 'outline';
        }
    };

    const columns = useMemo<ColumnDef<AdminLog>[]>(() => [
        { accessorKey: "created_at", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Fecha <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ getValue }) => new Date(getValue() as string).toLocaleString('es-ES', { hour12: false }) },
        { accessorKey: "level", header: "Nivel", cell: ({ getValue }) => <Badge variant={getLevelVariant(getValue() as string)}>{getValue() as string}</Badge> },
        { accessorKey: "event_type", header: "Tipo de Evento" },
        { accessorKey: "message", header: "Mensaje", cell: ({ getValue }) => <p className="max-w-xs truncate">{getValue() as string}</p> },
        { id: 'actions', header: () => <div className="text-center">Metadata</div>, cell: ({ row }) => {
            const hasMetadata = row.original.metadata && Object.keys(row.original.metadata).length > 0;
            return (
                <div className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => setViewingLog(row.original)} disabled={!hasMetadata}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            );
        }}
    ], []);

    const table = useReactTable({
        data: logs,
        columns,
        state: { sorting, globalFilter: debouncedFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /></div>;
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Visor de Logs del Sistema ({logs.length} registros)</CardTitle>
                    <CardDescription>Explora los eventos registrados para monitoreo y depuración.</CardDescription>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                         <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Buscar por mensaje, tipo de evento, etc..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v)}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filtrar por nivel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los niveles</SelectItem>
                                <SelectItem value="INFO">Info</SelectItem>
                                <SelectItem value="WARN">Warning</SelectItem>
                                <SelectItem value="ERROR">Error</SelectItem>
                                <SelectItem value="DEBUG">Debug</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
            <LogMetadataModal 
                isOpen={!!viewingLog} 
                onClose={() => setViewingLog(null)} 
                log={viewingLog}
            />
        </>
    );
}