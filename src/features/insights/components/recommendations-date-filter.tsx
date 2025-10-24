// src/features/insights/components/recommendations-date-filter.tsx
import * as React from 'react';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

export interface RecommendationsDateFilterProps {
  /** Rango seleccionado; si solo se desea fecha inicial, usar { from: Date, to: undefined } */
  value: DateRange | undefined;
  /** Llamado cuando cambia el rango. */
  onChange: (range: DateRange | undefined) => void;
  /** Texto de ayuda opcional que aparece junto al botón. */
  hint?: string;
}

/**
 * DatePicker (shadcn/ui) para filtrar recomendaciones por fecha/rango.
 *
 * - Usa Calendar en modo "range" para permitir seleccionar un rango opcional.
 * - Si se selecciona solo `from`, se interpreta como "desde esa fecha".
 * - Incluye botón para limpiar selección y volver al rango por defecto del sistema.
 */
export const RecommendationsDateFilter: React.FC<RecommendationsDateFilterProps> = ({ value, onChange, hint }) => {
  const label = React.useMemo(() => {
    if (!value?.from && !value?.to) return 'Fecha: últimos días';
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' });
    if (value?.from && value?.to) return `${fmt(value.from)} – ${fmt(value.to)}`;
    if (value?.from) return `Desde ${fmt(value.from)}`;
    return 'Fecha';
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start w-[240px]" aria-label="Elegir fecha">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="end">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value?.from || value?.to ? (
        <Button variant="ghost" size="icon" onClick={() => onChange(undefined)} aria-label="Limpiar fecha">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
      {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </div>
  );
};
