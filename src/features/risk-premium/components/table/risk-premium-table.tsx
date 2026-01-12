// src/features/risk-premium/components/table/risk-premium-table.tsx

import { useMemo, useState, useEffect } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '../../../../components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { DataTable } from '../../../dividends/components';
import { Card, CardContent } from '../../../../components/ui/card';
import { useDebounce } from '../../../../hooks/use-debounce';
import { getRiskColorClass } from '../../lib/risk-premium.utils';
import {
  RiskPremiumData,
  RiskPremiumTableProps,
} from '../../types/risk-premium.types';

/**
 * Formats a risk value based on the view mode.
 * @param value - The numeric risk value to format
 * @param viewMode - Display mode: 'percentage' shows %, 'points' shows basis points
 * @returns Formatted risk value string
 */
function formatRiskValue(value: number, viewMode: 'percentage' | 'points'): string {
  if (viewMode === 'points') {
    // Argentina Style: 15.40% -> 1540 pts (Puntos Básicos)
    // Multiplicamos por 100 y quitamos decimales
    return `${Math.round(value * 100).toLocaleString('es-AR')} pts`;
  }
  // Default: 15.40%
  return `${value.toFixed(2)}%`;
}

export function RiskPremiumTable({
  data,
  countryFilter,
  continentFilter,
  viewMode, // 'percentage' | 'points'
}: RiskPremiumTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  const debouncedCountryFilter = useDebounce(countryFilter, 300);

  const columns = useMemo<ColumnDef<RiskPremiumData>[]>(
    () => [
      {
        accessorKey: 'country',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            País
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium ml-3">{row.original.country}</div>
        ),
      },
      {
        accessorKey: 'continent',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Continente
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium ml-3">{row.original.continent}</div>
        ),
      },
      {
        accessorKey: 'countryRiskPremium',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-end"
          >
            Riesgo País {viewMode === 'points' ? '(pts)' : '(%)'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold ${getRiskColorClass(
              row.original.countryRiskPremium
            )}`}
          >
            {formatRiskValue(row.original.countryRiskPremium, viewMode)}
          </div>
        ),
      },
      {
        accessorKey: 'totalEquityRiskPremium',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-end"
          >
            Prima Total {viewMode === 'points' ? '(pts)' : '(%)'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold ${getRiskColorClass(
              row.original.totalEquityRiskPremium
            )}`}
          >
            {formatRiskValue(row.original.totalEquityRiskPremium, viewMode)}
          </div>
        ),
      },
    ],
    [viewMode] // Importante: Recalcular columnas si cambia el modo
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Filtros
  useEffect(() => {
    table.getColumn('country')?.setFilterValue(debouncedCountryFilter);
    table
      .getColumn('continent')
      ?.setFilterValue(continentFilter === 'all' ? '' : continentFilter);
  }, [debouncedCountryFilter, continentFilter, table]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          table={table}
          totalPages={table.getPageCount()}
          currentPage={pagination.pageIndex + 1}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </CardContent>
    </Card>
  );
}