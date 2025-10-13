// src/features/retirement/components/controls/parameter-control.tsx

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Slider } from "../../../../components/ui/slider";
import { ParameterControlProps } from "../../types/retirement.types";
import { clampValue } from "../../lib/retirement.utils";

/**
 * Control de parámetro con slider e input numérico
 */
export function ParameterControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  id,
}: ParameterControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        <span className="font-bold text-primary">
          {value}
          {unit}
        </span>
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
        onChange={(e) =>
          onChange(clampValue(Number(e.target.value) || 0, min, max))
        }
        min={min}
        max={max}
        step={step}
        className="w-24 text-right mt-1"
      />
    </div>
  );
}
