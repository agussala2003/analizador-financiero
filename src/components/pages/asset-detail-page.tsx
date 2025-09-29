import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDashboard } from "../../hooks/use-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ArrowLeft,
  Building,
  Globe,
  ExternalLink,
  Users,
  UserCircle,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Star,
  ShieldCheck,
  Scale,
  PieChart as PieChartIcon,
  MapPin,
  DollarSign,
  BarChart3,
  Newspaper,
  Info,
} from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { HistoricalPerformanceChart } from "../dashboard/historical-performance-chart";
import { indicatorConfig } from "../../utils/financial";
import { AssetData, AssetRating } from "../../types/dashboard";
import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const AssetDetailSkeleton = () => (
  <div className="space-y-8 container px-4 py-10 mx-auto sm:px-6 lg:px-8">
    <Skeleton className="h-8 w-32 rounded-md" />
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <Skeleton className="w-24 h-24 rounded-lg" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
    <Card>
      <CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </CardHeader>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
    <Skeleton className="h-12 w-full max-w-md rounded-lg" />
    <Skeleton className="h-80 w-full rounded-lg" />
  </div>
);

const RatingScorecard = ({
  rating,
  currentPrice,
  dcf,
}: {
  rating: AssetRating | null;
  currentPrice: number;
  dcf: number | "N/A";
}) => {
  if (!rating) return null;

  const scoreToStars = (score: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < score ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );

  const dcfDifference =
    typeof dcf === "number" && dcf > 0 ? ((currentPrice / dcf) - 1) * 100 : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-l-4 border-l-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Valoración (DCF)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Precio Actual</span>
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Valor Intrínseco (DCF)</span>
            <span className="text-2xl font-bold">
              {typeof dcf === "number" ? `$${dcf.toFixed(2)}` : <span className="text-muted-foreground">N/A</span>}
            </span>
          </div>
          {dcfDifference !== null && (
            <div
              className={`flex items-center justify-center p-3 rounded-lg ${
                dcfDifference > 5
                  ? "bg-red-500/10 text-red-500"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              {dcfDifference > 5 ? (
                <TrendingUp className="w-5 h-5 mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-2" />
              )}
              <span className="font-semibold">
                {dcfDifference > 5
                  ? `Sobrevalorada un ${dcfDifference.toFixed(2)}%`
                  : `Infravalorada un ${Math.abs(dcfDifference).toFixed(2)}%`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            Tarjeta de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Rating General</span>
            <span className="font-bold text-primary">
              {rating.rating} ({rating.overallScore}/5)
            </span>
          </div>
          <div className="pt-2 border-t border-border">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Retorno sobre Equity (ROE)</span> {scoreToStars(rating.returnOnEquityScore)}
              </li>
              <li className="flex justify-between">
                <span>Retorno sobre Activos (ROA)</span> {scoreToStars(rating.returnOnAssetsScore)}
              </li>
              <li className="flex justify-between">
                <span>Deuda / Equity</span> {scoreToStars(rating.debtToEquityScore)}
              </li>
              <li className="flex justify-between">
                <span>Precio / Ganancias (P/E)</span> {scoreToStars(rating.priceToEarningsScore)}
              </li>
              <li className="flex justify-between">
                <span>Precio / Valor Libros (P/B)</span> {scoreToStars(rating.priceToBookScore)}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RevenueSegmentationCharts = ({ asset }: { asset: AssetData }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold pointer-events-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ingresos por Geografía
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {asset.geographicRevenue && asset.geographicRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={asset.geographicRevenue}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {asset.geographicRevenue.map((_entry, index) => (
                    <Cell key={`cell-geo-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${(value / 1e9).toFixed(2)}B`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Info className="w-8 h-8 mr-2" />
              Sin datos geográficos
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Ingresos por Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {asset.productRevenue && asset.productRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={asset.productRevenue}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {asset.productRevenue.map((_entry, index) => (
                    <Cell key={`cell-prod-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${(value / 1e9).toFixed(2)}B`} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Info className="w-8 h-8 mr-2" />
              Sin datos de productos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const KeyMetric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-base font-bold text-foreground min-h-6 flex items-center justify-center sm:justify-start">
      {value}
    </p>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  </div>
);

const formatLargeNumber = (num: number | string) => {
  const n = Number(num);
  if (isNaN(n)) return <span className="text-muted-foreground">N/A</span>;
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString("es-ES");
};

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { assetsData, addTicker, loading } = useDashboard();

  useEffect(() => {
  if (symbol && !assetsData[symbol]) {
    addTicker(symbol, { addToSelected: false }); // 👈 ¡Clave!
  }
}, [symbol, assetsData, addTicker]);

  const asset = useMemo(() => (symbol ? assetsData[symbol] : null), [symbol, assetsData]);

  if (loading && !asset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <AssetDetailSkeleton />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold">Activo no encontrado</h2>
        <p className="text-muted-foreground mt-2">
          No pudimos encontrar datos para el símbolo <span className="font-mono bg-muted px-1 rounded">"{symbol}"</span>.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const financialSections = [
    {
      title: "Valoración",
      icon: <DollarSign className="w-4 h-4" />,
      keys: ["PER", "priceToBook", "priceToSales", "pfc_ratio", "evToEbitda", "earningsYield"],
    },
    {
      title: "Rentabilidad",
      icon: <BarChart3 className="w-4 h-4" />,
      keys: ["roe", "roa", "roic", "operatingMargin", "grossMargin"],
    },
    {
      title: "Salud Financiera",
      icon: <ShieldCheck className="w-4 h-4" />,
      keys: ["debtToEquity", "currentRatio", "netDebtToEBITDA", "payout_ratio"],
    },
  ];

  return (
    <motion.div
      className="container px-4 py-6 mx-auto sm:px-6 lg:px-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Button variant="outline" asChild className="mb-4">
        <Link to="/dashboard">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <img
          src={asset.image}
          alt={asset.companyName}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border object-contain bg-background shadow-sm"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{asset.companyName} ({asset.symbol})</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {asset.exchangeFullName}
          </p>
          <div className="flex items-baseline gap-4  flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold">${asset.currentPrice.toFixed(2)}</span>
            <span
              className={`flex items-center gap-1 text-lg font-semibold ${
                asset.dayChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {asset.dayChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {Math.abs(asset.dayChange).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <KeyMetric label="Market Cap" value={`$${formatLargeNumber(asset.marketCap)}`} />
          <KeyMetric label="Volumen" value={formatLargeNumber(asset.volume)} />
          <KeyMetric label="Vol. Promedio" value={formatLargeNumber(asset.averageVolume)} />
          <KeyMetric label="Beta" value={asset.beta ? asset.beta.toFixed(2) : <span className="text-muted-foreground">N/A</span>} />
          <KeyMetric label="Rango 52 Semanas" value={asset.range || <span className="text-muted-foreground">N/A</span>} />
          <KeyMetric
            label="Último Dividendo"
            value={asset.lastDividend > 0 ? `$${asset.lastDividend.toFixed(2)}` : <span className="text-muted-foreground">N/A</span>}
          />
        </CardContent>
      </Card>

      <RatingScorecard rating={asset.rating} currentPrice={asset.currentPrice} dcf={asset.dcf} />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Info className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Gráfico
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Finanzas
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> Noticias
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Acerca de {asset.companyName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-base leading-relaxed text-muted-foreground">{asset.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <InfoItem icon={<Briefcase className="w-5 h-5" />} label="Sector" value={asset.sector || "N/A"} />
                  <InfoItem icon={<Building className="w-5 h-5" />} label="Industria" value={asset.industry || "N/A"} />
                  <InfoItem icon={<UserCircle className="w-5 h-5" />} label="CEO" value={asset.ceo || "N/A"} />
                  <InfoItem
                    icon={<Users className="w-5 h-5" />}
                    label="Empleados"
                    value={asset.employees ? formatLargeNumber(asset.employees) : "N/A"}
                  />
                  <InfoItem icon={<Globe className="w-5 h-5" />} label="País" value={asset.country || "N/A"} />
                  <InfoItem
                    icon={<ExternalLink className="w-5 h-5" />}
                    label="Sitio Web"
                    value={
                      asset.website ? (
                        <a
                          href={asset.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block max-w-full"
                        >
                          {asset.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
            <RevenueSegmentationCharts asset={asset} />
          </TabsContent>

          <TabsContent value="chart" className="mt-6">
            <Card className="p-4">
              <HistoricalPerformanceChart assets={[asset]} />
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {financialSections.map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {section.icon} {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.keys.map((key) => {
                        const config = indicatorConfig[key as keyof typeof indicatorConfig];
                        const value = asset.data?.[key];
                        const displayValue =
                          typeof value === "number"
                            ? `${value.toFixed(2)}${config?.asPercent ? "%" : ""}`
                            : "N/A";
                        return (
                          <li
                            key={key}
                            className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-none"
                          >
                            <span className="text-muted-foreground">{config?.label || key}</span>
                            <span className="font-semibold">
                              {displayValue === "N/A" ? (
                                <span className="text-muted-foreground">N/A</span>
                              ) : (
                                displayValue
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <Newspaper className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Próximamente: Noticias del activo</p>
              </div>
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}