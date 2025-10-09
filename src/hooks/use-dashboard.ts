// src/hooks/use-dashboard.ts

import { useContext } from "react";
import { DashboardContext } from "../providers/dashboard-provider";
import { DashboardContextType } from "../types/dashboard";

/**
 * Hook personalizado para acceder al contexto del Dashboard.
 * Proporciona acceso a los tickers seleccionados, datos de activos y funciones de gestión.
 * * @throws {Error} Si se utiliza fuera de un `DashboardProvider`.
 * @returns {DashboardContextType} El valor completo del contexto del dashboard.
 */
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser utilizado dentro de un DashboardProvider');
  }
  return context;
};