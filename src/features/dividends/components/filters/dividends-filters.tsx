// src/features/dividends/components/filters/dividends-filters.tsx

import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Calendar } from "../../../../components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { CalendarIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DividendsFiltersProps } from "../../types/dividends.types";

/**
 * Barra de filtros para el calendario de dividendos
 * Permite filtrar por símbolo, rango de fechas de pago y frecuencia
 */
export const DividendsFilters: React.FC<DividendsFiltersProps> = ({
  symbolFilter,
  onSymbolFilterChange,
  paymentDateRange,
  onPaymentDateRangeChange,
  frequencyFilter,
  onFrequencyFilterChange,
  frequencyOptions,
  activeFiltersCount,
  onClearAllFilters,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filtro por símbolo */}
      <Input
        placeholder="Filtrar por Símbolo..."
        value={symbolFilter}
        onChange={(e) => onSymbolFilterChange(e.target.value)}
        className="h-9 w-full sm:w-auto sm:max-w-[160px] text-sm"
      />

      {/* Fecha de pago (Desde) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 w-full sm:w-52 md:w-64 justify-start text-left font-normal text-xs sm:text-sm ${
              !paymentDateRange?.from && "text-muted-foreground"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {paymentDateRange?.from ? (
              format(paymentDateRange.from, "dd/MM/yy")
            ) : (
              <span>Fecha Pago (Desde)</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="w-[250px]"
            mode="single"
            selected={paymentDateRange?.from}
            onSelect={(date) =>
              onPaymentDateRangeChange(
                paymentDateRange
                  ? { ...paymentDateRange, from: date ?? undefined, to: paymentDateRange.to ?? undefined }
                  : { from: date ?? undefined, to: undefined }
              )
            }
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Fecha de pago (Hasta) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 w-full sm:w-52 md:w-64 justify-start text-left font-normal text-xs sm:text-sm ${
              !paymentDateRange?.to && "text-muted-foreground"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {paymentDateRange?.to ? (
              format(paymentDateRange.to, "dd/MM/yy")
            ) : (
              <span>Fecha Pago (Hasta)</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            className="w-[250px]"
            mode="single"
            selected={paymentDateRange?.to}
            onSelect={(date) =>
              onPaymentDateRangeChange(
                paymentDateRange
                  ? { ...paymentDateRange, to: date ?? undefined, from: paymentDateRange.from ?? undefined }
                  : { from: undefined, to: date ?? undefined }
              )
            }
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Filtro por frecuencia */}
      <Select value={frequencyFilter} onValueChange={onFrequencyFilterChange}>
        <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-[150px] text-sm">
          <SelectValue placeholder="Frecuencia" />
        </SelectTrigger>
        <SelectContent>
          {frequencyOptions.map((freq) => (
            <SelectItem key={freq} value={freq} className="text-sm">
              {freq}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Botón limpiar filtros */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearAllFilters} className="h-9 w-full sm:w-auto text-xs sm:text-sm">
          <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Limpiar
        </Button>
      )}
    </div>
  );
};
