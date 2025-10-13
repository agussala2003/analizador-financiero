// src/features/retirement/components/controls/parameters-section.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { ParametersSectionProps } from "../../types/retirement.types";
import { ParameterControl } from "./parameter-control";

/**
 * Sección de parámetros ajustables de la calculadora
 */
export function ParametersSection({
  params,
  onParamsChange,
}: ParametersSectionProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Parámetros</CardTitle>
        <CardDescription>
          Ajusta los valores para ver cómo cambia tu futuro financiero.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ParameterControl
          label="Inversión Inicial"
          value={params.initialInvestment}
          onChange={(val) =>
            onParamsChange({ ...params, initialInvestment: val })
          }
          min={0}
          max={50000}
          step={500}
          unit=""
          id="initial-investment"
        />
        <ParameterControl
          label="Aporte Mensual"
          value={params.monthlyContribution}
          onChange={(val) =>
            onParamsChange({ ...params, monthlyContribution: val })
          }
          min={0}
          max={5000}
          step={50}
          unit=""
          id="monthly-contribution"
        />
        <ParameterControl
          label="Años de Inversión"
          value={params.years}
          onChange={(val) => onParamsChange({ ...params, years: val })}
          min={1}
          max={50}
          step={1}
          unit=" años"
          id="years"
        />
        <ParameterControl
          label="Rendimiento Anual"
          value={params.annualReturn}
          onChange={(val) => onParamsChange({ ...params, annualReturn: val })}
          min={0}
          max={20}
          step={0.5}
          unit="%"
          id="annual-return"
        />
      </CardContent>
    </Card>
  );
}
