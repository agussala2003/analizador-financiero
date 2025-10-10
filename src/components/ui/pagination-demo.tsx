// src/components/pagination-demo.tsx

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import { usePagination } from "../../hooks/use-pagination"; // ✅ Importamos el nuevo hook

interface PaginationDemoProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

export default function PaginationDemo({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationDemoProps) {
  // ✅ Toda la lógica compleja ahora vive en el hook
  const paginationRange = usePagination({ currentPage, totalPages, siblingCount });

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  // Si no hay páginas o solo hay una, no renderizamos nada
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={onPrevious} aria-disabled={currentPage === 1} />
        </PaginationItem>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={currentPage === pageNumber}
                onClick={() => onPageChange(pageNumber as number)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext onClick={onNext} aria-disabled={currentPage === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}