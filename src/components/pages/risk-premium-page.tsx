// src/pages/RiskPremiumPage.tsx (versión con tabla plana y paginación)

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useConfig } from "../../hooks/use-config";
import { logger } from "../../lib/logger";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Globe, Search, X, ArrowUpDown } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DataTable } from "../dividends/data-table";
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";

interface RiskPremiumData {
  country: string;
  continent: string;
  countryRiskPremium: number;
  totalEquityRiskPremium: number;
}

const RiskPremiumSkeleton = () => (
  <div className="space-y-8 container px-4 py-10 mx-auto sm:px-6 lg:px-8">
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
    </div>

    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-80" />
          <Skeleton className="h-10 w-full sm:w-60" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
      </CardHeader>
    </Card>

    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-5 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 4 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  </div>
);

export default function RiskPremiumPage() {
  const [data, setData] = useState<RiskPremiumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const config = useConfig();

  // Estados para TanStack Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  // --- Lógica de Fetch ---
  // --- Utilidad para error a string ---
  function errorToString(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  // --- Config type guard ---
  function extractFmpProxyEndpoint(raw: unknown): string {
    if (!raw || typeof raw !== 'object') return '';

    const api = (raw as { api?: unknown }).api;
    if (!api || typeof api !== 'object') return '';

    const fmpProxyEndpoints = (api as { fmpProxyEndpoints?: unknown }).fmpProxyEndpoints;
    if (!fmpProxyEndpoints || typeof fmpProxyEndpoints !== 'object') return '';

    const marketRiskPremium = (fmpProxyEndpoints as { marketRiskPremium?: unknown }).marketRiskPremium;
    if (typeof marketRiskPremium === 'string') {
      return marketRiskPremium;
    }

    return '';
  }

  useEffect(() => {
    const fetchRiskPremium = async () => {
      setLoading(true);
      const CACHE_KEY = "market_risk_premium";
      try {
        const { data: cached, error: cacheError }: { data: { data: RiskPremiumData[]; last_updated_at: string } | null; error: { code?: string } | null } = await supabase
          .from("asset_data_cache")
          .select("data, last_updated_at")
          .eq("symbol", CACHE_KEY)
          .single();

        if (cacheError && cacheError.code !== "PGRST116") throw new Error(errorToString(cacheError));

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (cached && new Date(cached.last_updated_at) > oneDayAgo) {
          setData(cached.data || []);
          return;
        }

        const endpoint = extractFmpProxyEndpoint(config);
        if (!endpoint) throw new Error('No se encontró el endpoint de riesgo país en la configuración.');

        const invokeResult = await supabase.functions.invoke(
          "fmp-proxy",
          {
            body: { endpointPath: endpoint },
          }
        );
        const apiData: RiskPremiumData[] | null = (invokeResult && 'data' in invokeResult) ? (invokeResult.data as RiskPremiumData[] | null) : null;
        const apiError: unknown = (invokeResult && 'error' in invokeResult) ? invokeResult.error : null;

        if (apiError) throw new Error(errorToString(apiError));

        const sortedData = (apiData ?? []).sort((a, b) =>
          a.country.localeCompare(b.country)
        );
        setData(sortedData);

        await supabase
          .from("asset_data_cache")
          .upsert({
            symbol: CACHE_KEY,
            data: sortedData,
            last_updated_at: new Date().toISOString(),
          });
      } catch (error: unknown) {
  void logger.error("RISK_PREMIUM_FETCH_FAILED", errorToString(error));
        toast.error("Error al obtener los datos de riesgo país.");
      } finally {
        setLoading(false);
      }
    };

  if (config) void fetchRiskPremium();
  }, [config]);

  // --- Colores para el Riesgo ---
  const getRiskColorClass = (premium: number) => {
    if (premium <= 5) return "text-green-600 dark:text-green-400";
    if (premium <= 10) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };
    
  // --- Definición de Columnas para la Tabla ---
  const columns = useMemo<ColumnDef<RiskPremiumData>[]>(() => [
    {
      accessorKey: "country",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          País
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium ml-3">{row.original.country}</div>
    },
    {
      accessorKey: "continent",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Continente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium ml-3">{row.original.continent}</div>
    },
    {
      accessorKey: "countryRiskPremium",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full justify-end">
          Prima País
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className={`text-right font-semibold ${getRiskColorClass(row.original.countryRiskPremium)}`}>
          {row.original.countryRiskPremium.toFixed(2)}%
        </div>
      )
    },
    {
      accessorKey: "totalEquityRiskPremium",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full justify-end">
          Prima Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className={`text-right font-semibold ${getRiskColorClass(row.original.totalEquityRiskPremium)}`}>
          {row.original.totalEquityRiskPremium.toFixed(2)}%
        </div>
      )
    }
  ], []);

  const continents = useMemo(() => [...new Set(data.map(item => item.continent))].sort(), [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // --- Lógica de Filtros ---
  // Hay que ajustar si el valor es "all" porque sino no matchea con los datos
  useEffect(() => {
    table.getColumn("country")?.setFilterValue(countryFilter);
    table.getColumn("continent")?.setFilterValue(continentFilter === "all" ? "" : continentFilter);
  }, [countryFilter, continentFilter, table]);
    
  if (loading) {
    return <RiskPremiumSkeleton />;
  }

  return (
    <motion.div
      className="container px-4 py-10 mx-auto sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 pb-4 mb-6 border-b">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Riesgo País</h1>
            <p className="text-muted-foreground">
              Consulta la prima de riesgo país y la prima total de acciones por país.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
       <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar país..."
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={continentFilter} onValueChange={setContinentFilter}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filtrar por continente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los continentes</SelectItem>
                        {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button
                    variant="ghost"
                    onClick={() => { setContinentFilter(""); setCountryFilter(""); }}
                    className="w-full sm:w-auto"
                >
                    <X className="w-4 h-4 mr-2" /> Limpiar
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            totalPages={table.getPageCount()}
            currentPage={pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}