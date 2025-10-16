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
      <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 mb-4 sm:mb-6 border-b">
        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
          <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Calculadora de Retiro</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Descubre el poder del interés compuesto y cómo invertir puede multiplicar tu patrimonio a largo plazo.
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

      {/* --- Mensaje educativo mejorado --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  💡 El Poder del Interés Compuesto
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Albert Einstein lo llamó <strong>"la octava maravilla del mundo"</strong>. 
                  El secreto está en reinvertir las ganancias: tu dinero genera intereses, 
                  y esos intereses a su vez generan más intereses. Con el tiempo, 
                  el efecto es exponencial. <strong>La clave es empezar temprano</strong> y 
                  ser constante con tus aportes mensuales.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Tiempo: tu mejor aliado</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Consistencia: aportes regulares</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Paciencia: deja crecer tu inversión</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}