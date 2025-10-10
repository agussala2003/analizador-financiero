// src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false, // Opcional: previene refetches automáticos
      retry: 2, // Reintenta las queries fallidas 2 veces
    },
  },
});