import { useContext } from "react";
import { PortfolioContext } from "../context/portfolioContext";

export function usePortfolio() {
  return useContext(PortfolioContext);
}
