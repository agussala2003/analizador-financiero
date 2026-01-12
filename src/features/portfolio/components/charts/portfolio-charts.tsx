// src/features/portfolio/components/charts/portfolio-charts.tsx

import React, { useMemo } from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Bar,
  BarChart,
  YAxis,
  CartesianGrid,
  LabelList,
  XAxis,
} from "../../../../components/charts/lazy-recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "../../../../components/ui/chart";
import { Holding } from "../../../../types/portfolio";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency, formatPercent } from "../../../../lib/utils";
import {
  calculateAllocationData,
  calculatePlData,
  generateChartConfig
} from "../../lib/portfolio.utils";
import { AssetHistorical, AssetData } from "../../../../types/dashboard";
import { HistoricalPerformanceChart } from "../../../dashboard/components/charts/historical-performance-chart";
import { AllocationChart } from "./allocation-chart";
import { usePortfolioAnalytics } from "../../hooks/use-portfolio-analytics";
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

/**
 * Hook personalizado para procesar datos de gráficos del portfolio.
 * Memoiza los cálculos para evitar recalcular en cada render.
 * 
 * @param holdings - Array de holdings actuales del portfolio
 * @returns Datos procesados para los gráficos (allocación, P&L, configuración)
 */
const useChartData = (holdings: Holding[]) => {
  return useMemo(() => {
    const { allocationData, totalValue } = calculateAllocationData(holdings);
    const plData = calculatePlData(holdings);
    const chartConfig = generateChartConfig(allocationData);

    return { allocationData, plData, chartConfig, totalValue };
  }, [holdings]);
};

/**
 * Componente de leyenda para gráficos.
 * Memoizado para evitar renders innecesarios.
 * 
 * @param color - Color del indicador
 * @param label - Etiqueta descriptiva
 */
const LegendItem = React.memo(({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div
      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
  </div>
));

/**
 * Props para el componente PortfolioCharts
 */
interface PortfolioChartsProps {
  /** Holdings actuales del portfolio */
  holdings: Holding[];
  /** Historial de precios agregado del portfolio (opcional) */
  portfolioHistory?: AssetHistorical[];
}

/**
 * Componente principal de gráficos del portfolio.
 * Muestra visualizaciones de distribución, rendimiento, y análisis sectorial/geográfico.
 * 
 * Optimizado con React.memo para evitar renders cuando los props no cambian.
 * 
 * @param holdings - Holdings actuales del portfolio
 * @param portfolioHistory - Historial de rendimiento agregado (opcional)
 */
export const PortfolioCharts = React.memo(function PortfolioCharts({ holdings, portfolioHistory }: PortfolioChartsProps) {
  const { allocationData, plData, chartConfig } = useChartData(holdings);
  const { data: analyticsData, isLoading: isAnalyticsLoading } = usePortfolioAnalytics();

  // Mock AssetData para el gráfico histórico
  // Memoized para evitar recrear el objeto en cada render si la historia no cambia
  const portfolioAsset = useMemo((): AssetData | null => {
    if (!portfolioHistory || portfolioHistory.length === 0) return null;

    const lastPoint = portfolioHistory[portfolioHistory.length - 1];

    // Construimos un objeto AssetData mínimo necesario para el componente HistoricalPerformanceChart
    return {
      symbol: 'PORTFOLIO',
      profile: {
        symbol: 'PORTFOLIO',
        companyName: 'Mi Portafolio',
        price: lastPoint.close,
        currency: 'USD',
        exchangeFullName: 'Personal',
        industry: 'Investment',
        website: '',
        description: 'Evolución histórica agregada.',
        ceo: 'Tú',
        sector: 'Financial',
        country: 'Global',
        fullTimeEmployees: '0',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        image: '',
        ipoDate: '',
        defaultImage: true,
        isEtf: false,
        isActivelyTrading: true,
        isAdr: false,
        isFund: true,
        beta: 1,
        marketCap: lastPoint.close,
        lastDividend: 0,
        volume: 0,
        averageVolume: 0,
        range: '',
        change: lastPoint.change ?? 0,
        changePercentage: lastPoint.changePercent ?? 0,
        cik: '',
        isin: '',
        cusip: '',
        exchange: 'N/A'
      },
      quote: {
        symbol: 'PORTFOLIO',
        name: 'Mi Portafolio',
        price: lastPoint.close,
        change: lastPoint.change ?? 0,
        changePercentage: lastPoint.changePercent ?? 0,
        volume: 0,
        dayLow: lastPoint.low,
        dayHigh: lastPoint.high,
        yearHigh: 0,
        yearLow: 0,
        marketCap: lastPoint.close,
        priceAvg50: 0,
        priceAvg200: 0,
        exchange: 'N/A',
        open: lastPoint.open,
        previousClose: lastPoint.close,
        timestamp: new Date(lastPoint.date).getTime()
      },
      historicalReturns: portfolioHistory,
      keyMetrics: {
        symbol: 'PORTFOLIO',
        marketCap: lastPoint.close,
        enterpriseValueTTM: 0,
        evToSalesTTM: 0,
        evToOperatingCashFlowTTM: 0,
        evToFreeCashFlowTTM: 0,
        evToEBITDATTM: 0,
        netDebtToEBITDATTM: 0,
        currentRatioTTM: 0,
        incomeQualityTTM: 0,
        grahamNumberTTM: 0,
        grahamNetNetTTM: 0,
        taxBurdenTTM: 0,
        interestBurdenTTM: 0,
        workingCapitalTTM: 0,
        investedCapitalTTM: 0,
        returnOnAssetsTTM: 0,
        operatingReturnOnAssetsTTM: 0,
        returnOnTangibleAssetsTTM: 0,
        returnOnEquityTTM: 0,
        returnOnInvestedCapitalTTM: 0,
        returnOnCapitalEmployedTTM: 0,
        earningsYieldTTM: 0,
        freeCashFlowYieldTTM: 0,
        capexToOperatingCashFlowTTM: 0,
        capexToDepreciationTTM: 0,
        capexToRevenueTTM: 0,
        salesGeneralAndAdministrativeToRevenueTTM: 0,
        researchAndDevelopementToRevenueTTM: 0,
        stockBasedCompensationToRevenueTTM: 0,
        intangiblesToTotalAssetsTTM: 0,
        averageReceivablesTTM: 0,
        averagePayablesTTM: 0,
        averageInventoryTTM: 0,
        daysOfSalesOutstandingTTM: 0,
        daysOfPayablesOutstandingTTM: 0,
        daysOfInventoryOutstandingTTM: 0,
        operatingCycleTTM: 0,
        cashConversionCycleTTM: 0,
        freeCashFlowToEquityTTM: 0,
        freeCashFlowToFirmTTM: 0,
        tangibleAssetValueTTM: 0,
        netCurrentAssetValueTTM: 0
      },
      priceTarget: {
        symbol: 'PORTFOLIO',
        lastMonthCount: 0,
        lastMonthAvgPriceTarget: 0,
        lastQuarterCount: 0,
        lastQuarterAvgPriceTarget: 0,
        lastYearCount: 0,
        lastYearAvgPriceTarget: 0,
        allTimeCount: 0,
        allTimeAvgPriceTarget: 0,
        publishers: []
      },
      dcf: [],
      rating: {
        symbol: 'PORTFOLIO',
        rating: 'N/A',
        overallScore: 0,
        discountedCashFlowScore: 0,
        returnOnEquityScore: 0,
        returnOnAssetsScore: 0,
        debtToEquityScore: 0,
        priceToEarningsScore: 0,
        priceToBookScore: 0
      },
      geography: {
        symbol: 'PORTFOLIO',
        fiscalYear: new Date().getFullYear(),
        period: 'FY',
        reportedCurrency: 'USD',
        date: new Date().toISOString(),
        data: {}
      },
      production: {
        symbol: 'PORTFOLIO',
        fiscalYear: new Date().getFullYear(),
        period: 'FY',
        reportedCurrency: 'USD',
        date: new Date().toISOString(),
        data: {}
      },
      priceTargetConsensus: {
        symbol: 'PORTFOLIO',
        targetHigh: 0,
        targetLow: 0,
        targetConsensus: 0,
        targetMedian: 0
      },
      keyMetricsYearly: [],
      dcfLevered: {
        symbol: 'PORTFOLIO',
        date: new Date().toISOString(),
        dcf: 0,
        'Stock Price': lastPoint.close
      },
      stockPriceChange: {
        symbol: 'PORTFOLIO',
        '1D': 0,
        '5D': 0,
        '1M': 0,
        '3M': 0,
        '6M': 0,
        ytd: 0,
        '1Y': 0,
        '3Y': 0,
        '5Y': 0,
        '10Y': 0,
        max: 0
      },
      ratios: [],
      analystEstimates: [],
      gradesConsensus: {
        symbol: 'PORTFOLIO',
        strongBuy: 0,
        buy: 0,
        hold: 0,
        sell: 0,
        strongSell: 0,
        consensus: 'N/A'
      }
    };
  }, [portfolioHistory]);

  if (holdings.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Gráfico Histórico */}
        {portfolioAsset && (
          <div className="col-span-1 lg:col-span-2">
            <HistoricalPerformanceChart assets={[portfolioAsset]} />
          </div>
        )}

        {/* Distribución por Activos */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Distribución por Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0 p-4 sm:p-6">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={({ active, payload }: { active?: boolean; payload?: Payload<number, string>[] }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0];
                      const name = data?.name ?? '';
                      const entry = allocationData.find((d) => d.name === name);
                      if (!entry) return null;

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
                              <span className="font-bold text-foreground">{formatCurrency(entry.value)}</span>
                              <span className="text-[0.70rem] text-muted-foreground">{entry.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie data={allocationData} dataKey="value" nameKey="name">
                    {allocationData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color ?? `var(--chart-${(allocationData.indexOf(entry) % 6) + 1})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardContent className="pt-0 p-3 sm:p-6">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
              {allocationData.map((entry) => (
                <LegendItem
                  key={entry.name}
                  color={chartConfig[entry.name]?.color ?? `var(--chart-${(allocationData.indexOf(entry) % 6) + 1})`}
                  label={`${entry.name} (${entry.percentage.toFixed(1)}%)`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retorno por Activo */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> Retorno por Activo (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ChartContainer config={{ pl: { label: "G/P (%)" } }} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="symbol" hide />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    // Domain auto para ajustar escala automáticamente según los datos (evita gráfico plano si rendimientos > 80% o < -30%)
                    domain={['auto', 'auto']}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={({ active, payload }: { active?: boolean; payload?: Payload<number, string>[] }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0];
                      const payloadData = data?.payload as { symbol?: string } | undefined;
                      const symbol = payloadData?.symbol ?? '';
                      const entry = plData.find((d) => d.symbol === symbol);
                      if (!entry) return null;

                      const plValue = entry.plValue;
                      const isPositive = plValue >= 0;

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.symbol}</span>
                              <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}{formatCurrency(Math.abs(plValue))}
                              </span>
                              <span className="text-[0.70rem] text-muted-foreground">{formatPercent(entry.pl)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="pl" radius={4}>
                    <LabelList dataKey="symbol" position="top" offset={8} className="fill-foreground caption font-medium" />
                    {plData.map((entry) => (
                      <Cell key={`cell-${entry.symbol}`} fill={entry.pl >= 0 ? "var(--chart-2)" : "var(--chart-4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardContent className="pt-0 p-3 sm:p-6">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-2">
              <LegendItem color="var(--chart-2)" label="Positivo" />
              <LegendItem color="var(--chart-4)" label="Negativo" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts (Sector & Country) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AllocationChart
          data={analyticsData?.sectorAllocation ?? []}
          type="sector"
          title="Diversificación por Sector"
          description="Exposición de tu portafolio a diferentes industrias."
          isLoading={isAnalyticsLoading}
        />
        <AllocationChart
          data={analyticsData?.countryAllocation ?? []}
          type="country"
          title="Exposición Geográfica"
          description="Distribución de tus activos por país de origen."
          isLoading={isAnalyticsLoading}
        />
      </div>
    </div>
  );
});