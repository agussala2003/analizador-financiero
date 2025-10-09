// src/hooks/use-pagination.ts

import { useMemo } from 'react';

interface UsePaginationProps {
  totalPages: number;
  siblingCount?: number;
  currentPage: number;
}

const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

/**
 * Hook para calcular la lógica de un componente de paginación,
 * incluyendo los puntos suspensivos (...) para rangos largos.
 * @returns El rango de páginas a mostrar.
 */
export const usePagination = ({
  totalPages,
  siblingCount = 1,
  currentPage,
}: UsePaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // 1ro + ... + siblings + actual + siblings + ... + último

    // Caso 1: Si el número de páginas es menor que los números que queremos mostrar
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Caso 2: No se muestran puntos a la izquierda
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Caso 3: No se muestran puntos a la derecha
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Caso 4: Se muestran puntos en ambos lados
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    
    return []; // Fallback por si acaso
  }, [totalPages, siblingCount, currentPage]);

  return paginationRange;
};