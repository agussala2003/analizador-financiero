// src/hooks/use-portfolio.ts

import { useContext } from "react";
import { PortfolioContext } from "../providers/portfolio-provider";
import { PortfolioContextType } from "../types/portfolio";

/**
 * Hook personalizado para acceder al contexto del Portafolio.
 * Proporciona acceso a transacciones, holdings, rendimiento y funciones de gestión.
 * * @throws {Error} Si se utiliza fuera de un `PortfolioProvider`.
 * @returns {PortfolioContextType} El valor completo del contexto del portafolio.
 */
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio debe ser utilizado dentro de un PortfolioProvider');
  }
  return context;
};