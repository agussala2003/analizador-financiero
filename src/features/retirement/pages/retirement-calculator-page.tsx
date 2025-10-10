import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { PiggyBank, TrendingUp, Zap } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "../../../components/ui/chart";

// Formato más flexible: muestra decimales solo si es necesario
const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }
  return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// --- Componente de Parámetro Editable ---
interface ParameterControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  id: string;
}
const ParameterControl: React.FC<ParameterControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  id,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <span className="font-bold text-primary">{value}{unit}</span>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <Input
        id={`${id}-input`}
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
        min={min}
        max={max}
        step={step}
        className="w-24 text-right mt-1"
      />
    </div>
  );
};

// --- Componente de Resultado Mejorado ---
interface ResultCardProps {
  title: string;
  value: string;
  colorClass?: string;
  subtitle?: string;
}
const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  colorClass,
  subtitle,
}) => (
  <div className="bg-muted/40 p-4 rounded-lg text-center border">
    <p className="text-sm text-muted-foreground mb-1">{title}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

// --- Página Principal de la Calculadora ---
export default function RetirementCalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [years, setYears] = useState(30);
  const [annualReturn, setAnnualReturn] = useState(8);

  interface ChartDatum {
    year: string;
    'Solo Ahorro': number;
    'Invirtiendo': number;
  }
  const chartData = useMemo<ChartDatum[]>(() => {
    const data: ChartDatum[] = [];
    let savedTotal = initialInvestment;
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 1; year <= years; year++) {
      savedTotal += monthlyContribution * 12;

      // Valor futuro de la inversión inicial
      const futureValueInitial = initialInvestment * Math.pow(1 + annualReturn / 100, year);
      
      // Valor futuro de las contribuciones mensuales
      let contributionFV = 0;
      if (monthlyRate > 0) {
        contributionFV = (monthlyContribution * (Math.pow(1 + monthlyRate, year * 12) - 1)) / monthlyRate;
      } else {
        contributionFV = monthlyContribution * 12 * year;
      }

      const investedTotal = futureValueInitial + contributionFV;

      data.push({
        year: `Año ${year}`,
        'Solo Ahorro': savedTotal,
        'Invirtiendo': investedTotal,
      });
    }
    return data;
  }, [initialInvestment, monthlyContribution, years, annualReturn]);

  const finalAhorro: number = chartData.length > 0 ? chartData[chartData.length - 1]["Solo Ahorro"] : 0;
  const finalInversion: number = chartData.length > 0 ? chartData[chartData.length - 1].Invirtiendo : 0;
  const diferencia: number = finalInversion - finalAhorro;
  const porcentajeMejor: number = finalAhorro > 0 ? ((diferencia / finalAhorro) * 100) : 0;

  const chartConfig: ChartConfig = {
    'Solo Ahorro': {
      label: 'Solo Ahorro',
      color: "hsl(var(--chart-3))", // Amarillo suave
    },
    'Invirtiendo': {
      label: 'Invirtiendo',
      color: "hsl(var(--chart-1))", // Azul/verde
    },
  };

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <PiggyBank className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calculadora de Retiro</h1>
          <p className="text-muted-foreground mt-1">
            Descubre el poder del interés compuesto: cómo invertir puede multiplicar tu patrimonio a largo plazo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Columna de Controles --- */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parámetros</CardTitle>
            <CardDescription>Ajusta los valores para ver cómo cambia tu futuro financiero.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ParameterControl
              label="Inversión Inicial"
              value={initialInvestment}
              onChange={setInitialInvestment}
              min={0}
              max={50000}
              step={500}
              unit=""
              id="initial-investment"
            />
            <ParameterControl
              label="Aporte Mensual"
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={5000}
              step={50}
              unit=""
              id="monthly-contribution"
            />
            <ParameterControl
              label="Años de Inversión"
              value={years}
              onChange={setYears}
              min={1}
              max={50}
              step={1}
              unit=" años"
              id="years"
            />
            <ParameterControl
              label="Rendimiento Anual"
              value={annualReturn}
              onChange={setAnnualReturn}
              min={0}
              max={20}
              step={0.5}
              unit="%"
              id="annual-return"
            />
          </CardContent>
        </Card>

        {/* --- Columna de Resultados --- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Proyección de Crecimiento ({years} años)
            </CardTitle>
            <CardDescription>
              Comparación entre ahorrar sin invertir vs. invertir con rendimiento compuesto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard
                title="Solo Ahorro"
                value={formatCurrency(finalAhorro)}
                colorClass="text-yellow-500"
              />
              <ResultCard
                title="Invirtiendo"
                value={formatCurrency(finalInversion)}
                colorClass="text-green-500"
              />
              <ResultCard
                title="Diferencia"
                value={formatCurrency(diferencia)}
                colorClass="text-blue-500"
                subtitle={`+${porcentajeMejor.toFixed(0)}%`}
              />
            </div>

            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <defs>
                    <linearGradient id="fillAhorro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-Solo Ahorro)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-Solo Ahorro)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillInvirtiendo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-Invirtiendo)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-Invirtiendo)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="Solo Ahorro"
                    stackId="1"
                    stroke="var(--color-Solo Ahorro)"
                    fill="url(#fillAhorro)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Invirtiendo"
                    stackId="1"
                    stroke="var(--color-Invirtiendo)"
                    fill="url(#fillInvirtiendo)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- Mensaje educativo --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto"
      >
        <p className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <strong>El interés compuesto es la octava maravilla del mundo.</strong> Pequeños aportes regulares + tiempo = gran patrimonio.
        </p>
      </motion.div>
    </motion.div>
  );
}