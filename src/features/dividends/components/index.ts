// src/features/dividends/components/index.ts

export { columns } from "./table/columns";
export { DataTable } from "./table/data-table";
export { DataTableVirtualized } from "./table/data-table-virtualized";
export { DividendsFilters } from "./filters/dividends-filters";
export { DividendsSkeleton } from "./skeleton/dividends-skeleton";

// Re-export types
export type { Dividend } from "../types/dividends.types";
