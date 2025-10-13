// src/features/dividends/pages/dividends-page.tsx

import React from "react";
import { columns, DataTable, DataTableVirtualized, DividendsFilters, DividendsSkeleton, Dividend } from "../components";
import { supabase } from "../../../lib/supabase";
import { logger } from "../../../lib/logger";
import { toast } from "sonner";
import { useConfig } from "../../../hooks/use-config";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Divide, List, LayoutGrid } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { DateRange } from "react-day-picker";
import { isDividend } from "../../../utils/type-guards";
import { AssetDataCacheRow } from "../types/dividends.types";
import { extractUniqueFrequencies, validateConfig, getDividendsEndpoint } from "../lib/dividends.utils";

const DividendsPage: React.FC = () => {
  const [data, setData] = React.useState<Dividend[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const config = useConfig();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 });

  // --- ESTADOS DE FILTRO ACTUALIZADOS A RANGO DE FECHAS ---
  const [symbolFilter, setSymbolFilter] = React.useState<string>("");
  const [paymentDateRange, setPaymentDateRange] = React.useState<DateRange | undefined>();
  const [frequencyFilter, setFrequencyFilter] = React.useState<string>("");
  
  // --- MODO DE VISTA: paginado vs virtualizado ---
  const [useVirtualScroll, setUseVirtualScroll] = React.useState<boolean>(false);

  const frequencyOptions = React.useMemo(() => extractUniqueFrequencies(data), [data]);

  React.useEffect(() => {
    const fetchDividends = async () => {
      setLoading(true);
      const CACHE_KEY = 'dividends_calendar';
      try {
        const { data: cached } = await supabase.from('asset_data_cache').select('data, last_updated_at').eq('symbol', CACHE_KEY).single();
        const cacheRow = cached as AssetDataCacheRow | null;
        if (cacheRow && new Date(cacheRow.last_updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          const arr = Array.isArray(cacheRow.data) ? cacheRow.data : [];
          setData(arr.filter(isDividend));
          return;
        }
        // Validate config and get endpoint
        if (!validateConfig(config)) {
          throw new Error("Configuración inválida");
        }
        const endpointPath = getDividendsEndpoint(config);
        const invokeResult = await supabase.functions.invoke('fmp-proxy', { body: { endpointPath } });
        const invokeResultObj = invokeResult as unknown as Record<string, unknown>;
        const apiData = invokeResultObj.data;
        const apiError = invokeResultObj.error;
        if (Array.isArray(apiData)) {
          setData(apiData.filter(isDividend));
          void supabase.from('asset_data_cache').upsert({ symbol: CACHE_KEY, data: apiData, last_updated_at: new Date().toISOString() });
        } else if (cacheRow) {
          const arr = Array.isArray(cacheRow.data) ? cacheRow.data : [];
          setData(arr.filter(isDividend));
          // toast.warning("Datos desactualizados.");
        } else {
          throw new Error(typeof apiError === 'string' ? apiError : "No se pudieron obtener los dividendos.");
        }
      } catch (error) {
        const err = error as { message?: string };
        toast.error("Error al obtener los dividendos.");
        void logger.error("DIVIDENDS_FETCH_FAILED", err.message ?? String(error));
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchDividends();
  }, [config]);

  const table = useReactTable({
    data,
    columns,
    state: { 
      sorting, 
      columnFilters, 
      ...(useVirtualScroll ? {} : { pagination }) // solo usar pagination en modo paginado
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(useVirtualScroll ? {} : { getPaginationRowModel: getPaginationRowModel() }), // solo paginar en modo paginado
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
        <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b">
          <div className="flex items-center gap-4">
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
          
          {/* Toggle de vista: paginado vs virtual scroll */}
          <div className="flex gap-2">
            <Button
              variant={!useVirtualScroll ? "default" : "outline"}
              size="sm"
              onClick={() => setUseVirtualScroll(false)}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Paginado</span>
            </Button>
            <Button
              variant={useVirtualScroll ? "default" : "outline"}
              size="sm"
              onClick={() => setUseVirtualScroll(true)}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Virtual</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <DividendsSkeleton />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
          <Card>
            {/* --- BARRA DE FILTROS CON RANGO DE FECHAS --- */}
            <CardHeader className="p-4 border-b">
              <DividendsFilters
                symbolFilter={symbolFilter}
                onSymbolFilterChange={setSymbolFilter}
                paymentDateRange={paymentDateRange}
                onPaymentDateRangeChange={setPaymentDateRange}
                frequencyFilter={frequencyFilter}
                onFrequencyFilterChange={setFrequencyFilter}
                frequencyOptions={frequencyOptions}
                activeFiltersCount={activeFiltersCount}
                onClearAllFilters={handleClearAllFilters}
              />
            </CardHeader>
            <CardContent className="p-0">
              {useVirtualScroll ? (
                <DataTableVirtualized
                  table={table}
                  estimateSize={73}
                />
              ) : (
                <DataTable
                  table={table}
                  totalPages={table.getPageCount()}
                  currentPage={pagination.pageIndex + 1}
                  onPageChange={(page) => table.setPageIndex(page - 1)}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DividendsPage;