// src/pages/RiskPremiumPage.tsx (con paginación)

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useConfig } from "../../hooks/use-config";
import { logger } from "../../lib/logger";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
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
import { Globe, Search, Filter, X } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// 👇 Importa tu componente de paginación
import PaginationDemo from "../pagination-demo";

interface RiskPremiumData {
  country: string;
  continent: string;
  countryRiskPremium: number;
  totalEquityRiskPremium: number;
}

const RiskPremiumSkeleton = () => (
  <div className="space-y-8 p-4 sm:p-6">
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

    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-0">
          <Skeleton className="h-12 w-full" />
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ITEMS_PER_PAGE = 10;

export default function RiskPremiumPage() {
  const [data, setData] = useState<RiskPremiumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const config = useConfig();

  useEffect(() => {
    const fetchRiskPremium = async () => {
      setLoading(true);
      const CACHE_KEY = "market_risk_premium";
      try {
        const { data: cached, error: cacheError } = await supabase
          .from("asset_data_cache")
          .select("data, last_updated_at")
          .eq("symbol", CACHE_KEY)
          .single();

        if (cacheError && cacheError.code !== "PGRST116") throw cacheError;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (cached && new Date(cached.last_updated_at) > oneDayAgo) {
          setData(cached.data || []);
          return;
        }

        const { data: apiData, error: apiError } = await supabase.functions.invoke(
          "fmp-proxy",
          {
            body: { endpointPath: config.api.fmpProxyEndpoints.marketRiskPremium },
          }
        );

        if (apiError) throw apiError;

        const sortedData = (apiData || []).sort((a: RiskPremiumData, b: RiskPremiumData) =>
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
      } catch (error: any) {
        logger.error("RISK_PREMIUM_FETCH_FAILED", error.message);
        toast.error("Error al obtener los datos de riesgo país.");
      } finally {
        setLoading(false);
      }
    };

    if (config) fetchRiskPremium();
  }, [config]);

  // 1. Aplicar filtros
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        (continentFilter ? item.continent === continentFilter : true) &&
        (countryFilter
          ? item.country.toLowerCase().includes(countryFilter.toLowerCase())
          : true)
    );
  }, [data, continentFilter, countryFilter]);

  // 2. Calcular paginación
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // 3. Reagrupar los datos paginados por continente (para los acordeones)
  const groupedPaginatedData = useMemo(() => {
    return paginatedData.reduce((acc, item) => {
      (acc[item.continent] = acc[item.continent] || []).push(item);
      return acc;
    }, {} as Record<string, RiskPremiumData[]>);
  }, [paginatedData]);

  const continents = useMemo(
    () => [...new Set(data.map((item) => item.continent))].sort(),
    [data]
  );

  const getRiskColorClass = (premium: number) => {
    if (premium <= 5) return "text-emerald-600 dark:text-emerald-400";
    if (premium <= 10) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getRiskBgClass = (premium: number) => {
    if (premium <= 5) return "bg-emerald-50 dark:bg-emerald-900/20";
    if (premium <= 10) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-rose-50 dark:bg-rose-900/20";
  };

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [countryFilter, continentFilter]);

  if (loading) {
    return <RiskPremiumSkeleton />;
  }

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Prima de Riesgo de Mercado</h1>
          <p className="text-muted-foreground">
            Analiza la prima de riesgo por país y continente para tomar decisiones informadas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por país..."
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select value={continentFilter} onValueChange={setContinentFilter}>
                <SelectTrigger className="min-w-[180px] transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Continente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Todos los continentes</SelectItem>
                  {continents.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContinentFilter("");
                  setCountryFilter("");
                }}
                className="flex items-center gap-2 h-10"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resultados */}
      {filteredData.length === 0 ? (
        <Card className="text-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron resultados para los filtros aplicados.</p>
        </Card>
      ) : (
        <>
          <Accordion type="multiple" defaultValue={Object.keys(groupedPaginatedData)} className="space-y-3">
            {Object.entries(groupedPaginatedData).map(([continent, countries]) => (
              <Card key={continent} className="overflow-hidden border-border/50">
                <AccordionItem value={continent} className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full text-left">
                      <span className="text-lg font-semibold text-foreground">{continent}</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {countries.length} país{countries.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="font-medium text-muted-foreground w-1/3">País</TableHead>
                            <TableHead className="text-right font-medium text-muted-foreground w-1/3">
                              Prima País
                            </TableHead>
                            <TableHead className="text-right font-medium text-muted-foreground w-1/3">
                              Prima Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {countries.map((country) => (
                            <TableRow
                              key={country.country}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="font-medium py-3">{country.country}</TableCell>
                              <TableCell
                                className={`text-right font-semibold py-3 ${getRiskColorClass(
                                  country.countryRiskPremium
                                )} ${getRiskBgClass(country.countryRiskPremium)}`}
                              >
                                {country.countryRiskPremium.toFixed(2)}%
                              </TableCell>
                              <TableCell
                                className={`text-right font-semibold py-3 ${getRiskColorClass(
                                  country.totalEquityRiskPremium
                                )} ${getRiskBgClass(country.totalEquityRiskPremium)}`}
                              >
                                {country.totalEquityRiskPremium.toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pt-4">
              <PaginationDemo
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                siblingCount={1}
              />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}