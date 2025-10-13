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

export function RiskPremiumTable({
  data,
  countryFilter,
  continentFilter,
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
            Prima País
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold ${getRiskColorClass(
              row.original.countryRiskPremium
            )}`}
          >
            {row.original.countryRiskPremium.toFixed(2)}%
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
            Prima Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={`text-right font-semibold ${getRiskColorClass(
              row.original.totalEquityRiskPremium
            )}`}
          >
            {row.original.totalEquityRiskPremium.toFixed(2)}%
          </div>
        ),
      },
    ],
    []
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

  // Apply filters to table columns
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
