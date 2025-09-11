import { useContext } from "react";
import { TourContext } from "../context/tourContext";

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour debe ser usado dentro de un TourProvider');
  }
  return context;
}
