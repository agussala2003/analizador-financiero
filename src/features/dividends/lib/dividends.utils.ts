// src/features/dividends/lib/dividends.utils.ts

import { FilterFn, Row } from "@tanstack/react-table";
import { DateRange } from "react-day-picker";
import { Dividend } from "../types/dividends.types";

/**
 * Función de filtro personalizada para rangos de fechas en react-table
 * Permite filtrar dividendos por un rango de fechas (from - to)
 */
export const dateInRangeFilterFn: FilterFn<Dividend> = (
  row: Row<Dividend>,
  columnId: string,
  filterValue: DateRange
) => {
  if (!filterValue || (!filterValue.from && !filterValue.to)) {
    return true;
  }

  const rowDate = new Date(row.getValue(columnId));
  if (isNaN(rowDate.getTime())) return false;

  const { from, to } = filterValue;

  // Ajustamos 'to' para que incluya todo el día
  const toDate = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : null;

  if (from && toDate) {
    return rowDate >= from && rowDate <= toDate;
  }
  if (from) {
    return rowDate >= from;
  }
  if (toDate) {
    return rowDate <= toDate;
  }
  return true;
};

/**
 * Formatea una fecha a formato local español
 */
export const formatDateES = (value: string | number | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("es-ES");
};

/**
 * Formatea un valor numérico como moneda USD
 */
export const formatCurrency = (value: unknown): string => {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `$${value.toFixed(2)}`;
};

/**
 * Formatea un valor numérico como porcentaje
 */
export const formatPercentage = (value: unknown): string => {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `${value.toFixed(2)}%`;
};

/**
 * Capitaliza la primera letra de un string
 */
export const capitalizeFrequency = (frequency: unknown): string => {
  if (typeof frequency !== "string" || !frequency) return "-";
  return frequency.toLowerCase();
};

/**
 * Extrae opciones únicas de frecuencia desde los datos
 */
export const extractUniqueFrequencies = (dividends: Dividend[]): string[] => {
  return Array.from(new Set(dividends.map((d) => d.frequency).filter(Boolean)));
};

/**
 * Valida la estructura de configuración necesaria para fetch de dividendos
 */
export const validateConfig = (config: unknown): boolean => {
  if (!config || typeof config !== "object" || config === null) return false;

  const configObj = config as Record<string, unknown>;
  if (!("api" in configObj) || typeof configObj.api !== "object" || configObj.api === null) {
    return false;
  }

  const apiObj = configObj.api as Record<string, unknown>;
  if (!("fmpProxyEndpoints" in apiObj) || typeof apiObj.fmpProxyEndpoints !== "object") {
    return false;
  }

  const endpoints = apiObj.fmpProxyEndpoints as Record<string, unknown>;
  return typeof endpoints.dividendsCalendar === "string";
};

/**
 * Obtiene el endpoint de dividendos desde la configuración
 */
export const getDividendsEndpoint = (config: unknown): string => {
  const configObj = config as Record<string, unknown>;
  const apiObj = configObj.api as Record<string, unknown>;
  const endpoints = apiObj.fmpProxyEndpoints as Record<string, unknown>;
  return endpoints.dividendsCalendar as string;
};
