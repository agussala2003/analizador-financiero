// src/features/retirement/pages/retirement-calculator-page.tsx

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { PiggyBank, TrendingUp, Zap } from "lucide-react";
import { RetirementParams } from "../types/retirement.types";
import { generateChartData, calculateResults } from "../lib/retirement.utils";
import {
  ParametersSection,
  ResultsSection,
  RetirementChart,
} from "../components";

export default function RetirementCalculatorPage() {
  const [params, setParams] = useState<RetirementParams>({
    initialInvestment: 1000,
    monthlyContribution: 300,
    years: 30,
    annualReturn: 8,
  });

  const chartData = useMemo(
    () => generateChartData(params),
    [params]
  );

  const results = useMemo(
    () => calculateResults(chartData),
    [chartData]
  );

  return (
    <motion.div
      className="container-wide stack-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <PiggyBank className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="heading-2">Calculadora de Retiro</h1>
          <p className="body text-muted-foreground mt-1">
            Descubre el poder del interés compuesto: cómo invertir puede multiplicar tu patrimonio a largo plazo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Columna de Controles --- */}
        <ParametersSection params={params} onParamsChange={setParams} />

        {/* --- Columna de Resultados --- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Proyección de Crecimiento ({params.years} años)
            </CardTitle>
            <CardDescription>
              Comparación entre ahorrar sin invertir vs. invertir con rendimiento
              compuesto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResultsSection
              finalAhorro={results.finalAhorro}
              finalInversion={results.finalInversion}
              diferencia={results.diferencia}
              porcentajeMejor={results.porcentajeMejor}
            />

            <RetirementChart chartData={chartData} years={params.years} />
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
          <strong>El interés compuesto es la octava maravilla del mundo.</strong>{" "}
          Pequeños aportes regulares + tiempo = gran patrimonio.
        </p>
      </motion.div>
    </motion.div>
  );
}