import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** cantidad de páginas a mostrar alrededor de la actual (por cada lado) */
  siblingCount?: number;
};

export default function PaginationDemo({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: Props) {
  // helpers
  const goto = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // decide qué páginas mostrar de forma compacta
  const pages: (number | "ellipsis")[] = [];

  // always show first
  pages.push(1);

  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  if (left > 2) {
    pages.push("ellipsis");
  }

  for (let p = left; p <= right; p++) {
    pages.push(p);
  }

  if (right < totalPages - 1) {
    pages.push("ellipsis");
  }

  if (totalPages > 1) pages.push(totalPages);

  // small helper to render a compact button style (Tailwind)
  const buttonClass = "px-2 py-1 rounded-md text-sm min-w-[36px]";

  return (
    <div className="w-full flex justify-center">
      <Pagination className="w-full max-w-[420px]">
        <PaginationContent className="flex items-center gap-2 px-3 py-2 bg-transparent">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => goto(currentPage === 1 ? 1 : currentPage - 1)}
              className={`disabled:opacity-50 ${buttonClass}`}
            />
          </PaginationItem>

          {pages.map((item, idx) =>
            item === "ellipsis" ? (
              <PaginationItem key={`e-${idx}`}>
                <PaginationEllipsis className={`${buttonClass} pointer-events-none`} />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={currentPage === item}
                  onClick={() => goto(item)}
                  className={`${buttonClass} ${
                    currentPage === item ? "font-semibold" : "font-normal"
                  }`}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                goto(currentPage === totalPages ? totalPages : currentPage + 1)
              }
              className={`disabled:opacity-50 ${buttonClass}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
