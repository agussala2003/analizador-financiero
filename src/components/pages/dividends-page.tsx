import React from "react";
import { columns } from "../dividends/columns";
import { DataTable } from "../dividends/data-table";
import { supabase } from "../../lib/supabase";
import { logger } from "../../lib/logger";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useConfig } from "../../hooks/use-config";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CalendarIcon, Divide, XIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { es } from "date-fns/locale";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Dividend } from "../dividends/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateRange } from "react-day-picker";

// ... (Componente Skeleton sin cambios)
const TableSkeleton = () => (
  <Card>
    <CardHeader className="p-4 border-b"><div className="flex flex-wrap items-center gap-2"><Skeleton className="w-full h-9 rounded-md sm:w-40" /><Skeleton className="w-full h-9 rounded-md sm:w-48" /><Skeleton className="w-full h-9 rounded-md sm:w-48" /><Skeleton className="w-full h-9 rounded-md sm:w-40" /></div></CardHeader>
    <CardContent className="p-0"><div className="p-4 space-y-2">{[...Array(10)].map((_, i) => (<Skeleton key={i} className="w-full h-12 rounded-md" />))}</div></CardContent>
  </Card>
);


export default function DividendsPage() {
  const [data, setData] = React.useState<Dividend[]>([]);
  const [loading, setLoading] = React.useState(true);
  const config = useConfig();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  // --- ESTADOS DE FILTRO ACTUALIZADOS A RANGO DE FECHAS ---
  const [symbolFilter, setSymbolFilter] = React.useState<string>("");
  const [paymentDateRange, setPaymentDateRange] = React.useState<DateRange | undefined>();
  const [frequencyFilter, setFrequencyFilter] = React.useState<string>("");

  const frequencyOptions = React.useMemo(() => Array.from(new Set(data.map(d => d.frequency).filter(Boolean))), [data]);

  // ... (Lógica de Fetch sin cambios)
  React.useEffect(() => {
    const fetchDividends = async () => { setLoading(true); const CACHE_KEY = 'dividends_calendar'; try { const { data: cached } = await supabase.from('asset_data_cache').select('data, last_updated_at').eq('symbol', CACHE_KEY).single(); if (cached && new Date(cached.last_updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) { setData(cached.data || []); return; } const { data: apiData, error: apiError } = await supabase.functions.invoke('fmp-proxy', { body: { endpointPath: config.api.fmpProxyEndpoints.dividendsCalendar } }); if (apiData) { setData(apiData || []); await supabase.from('asset_data_cache').upsert({ symbol: CACHE_KEY, data: apiData, last_updated_at: new Date().toISOString() }); } else if (cached) { setData(cached.data || []); toast.warning("Datos desactualizados."); } else { throw apiError || new Error("No se pudieron obtener los dividendos."); } } catch (error: any) { toast.error("Error al obtener los dividendos."); logger.error("DIVIDENDS_FETCH_FAILED", error.message); setData([]); } finally { setLoading(false); } };
    fetchDividends();
  }, [config]);

  const table = useReactTable({
    data, columns, state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    table.getColumn("symbol")?.setFilterValue(symbolFilter || undefined);
    table.getColumn("paymentDate")?.setFilterValue(paymentDateRange);
    table.getColumn("frequency")?.setFilterValue(frequencyFilter || undefined);
  }, [symbolFilter, paymentDateRange, frequencyFilter, table]);

  const handleClearAllFilters = () => {
    setSymbolFilter("");
    setPaymentDateRange(undefined);
    setFrequencyFilter("");
    table.resetColumnFilters();
  };

  const activeFiltersCount = table.getState().columnFilters.length;

  return (
    <div className="container px-4 py-10 mx-auto sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 pb-4 mb-6 border-b">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Divide className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendario de Dividendos</h1>
            <p className="text-muted-foreground">
              Consulta y filtra las fechas importantes de los próximos dividendos.
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? <TableSkeleton /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <Card>
            {/* --- BARRA DE FILTROS CON RANGO DE FECHAS --- */}
            <CardHeader className="p-4 border-b">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Filtrar por Símbolo..."
                  value={symbolFilter}
                  onChange={(e) => setSymbolFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto sm:max-w-[160px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`h-9 w-full sm:w-64 justify-start text-left font-normal ${!paymentDateRange?.from && "text-muted-foreground"}`}>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {paymentDateRange?.from ? format(paymentDateRange.from, "dd/MM/yy") : <span>Fecha Pago (Desde)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar className="w-[250px]" mode="single" selected={paymentDateRange?.from} onSelect={(date) => setPaymentDateRange((prev: any) => ({ ...prev, from: date }))} locale={es} initialFocus />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`h-9 w-full sm:w-64 justify-start text-left font-normal ${!paymentDateRange?.to && "text-muted-foreground"}`}>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {paymentDateRange?.to ? format(paymentDateRange.to, "dd/MM/yy") : <span>Fecha Pago (Hasta)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar className="w-[250px]" mode="single" selected={paymentDateRange?.to} onSelect={(date) => setPaymentDateRange((prev: any) => ({ ...prev, to: date }))} locale={es} initialFocus />
                  </PopoverContent>
                </Popover>
                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-[150px]"><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                  <SelectContent>{frequencyOptions.map(freq => <SelectItem key={freq} value={freq}>{freq}</SelectItem>)}</SelectContent>
                </Select>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={handleClearAllFilters} className="h-9 w-full sm:w-auto">
                    <XIcon className="w-4 h-4 mr-2" /> Limpiar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                table={table}
                totalPages={table.getPageCount()}
                currentPage={pagination.pageIndex + 1}
                onPageChange={(page) => table.setPageIndex(page - 1)}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}