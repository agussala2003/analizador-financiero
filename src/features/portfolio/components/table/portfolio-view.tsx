// src/features/portfolio/components/table/portfolio-view.tsx

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../../components/ui/alert-dialog';
import { PortfolioViewProps } from '../../types/portfolio.types';
import { HoldingWithMetrics } from '../../../../types/portfolio';
import { formatCurrency, formatPercent, formatQuantity } from '../../lib/portfolio.utils';

export const PortfolioView = React.memo(function PortfolioView({ holdings, onDeleteAsset, onAddMore, onSell }: PortfolioViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<HoldingWithMetrics>[]>(() => [
    { accessorKey: 'symbol', header: 'Activo' },
    {
      accessorKey: 'quantity',
      header: 'Cantidad',
      cell: ({ getValue }) => formatQuantity(getValue() as number),
    },
    {
      accessorKey: 'avgPurchasePrice',
      header: 'Precio Prom.',
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: 'currentPrice',
      header: 'Precio Actual',
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: 'marketValue',
      header: 'Valor Mercado',
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: 'pl',
      header: 'G/P ($)',
      cell: ({ getValue }) => {
        const val = Number(getValue());
        return <span className={val >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrency(val)}</span>;
      },
    },
    {
      accessorKey: 'plPercent',
      header: 'G/P (%)',
      cell: ({ getValue }) => {
        const val = Number(getValue());
        return <span className={val >= 0 ? 'text-green-500' : 'text-red-500'}>{formatPercent(val)}</span>;
      },
    },
    {
      accessorKey: 'holdingDays',
      header: 'Días',
      cell: ({ getValue }) => {
        const days = Number(getValue());
        return <span className="text-muted-foreground">{days}d</span>;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const holding = row.original;
        return (
          <div className="flex justify-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddMore(holding.symbol, holding.currentPrice)}
              aria-label={`Agregar más ${holding.symbol}`}
            >
              <PlusCircle className="w-4 h-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSell(holding)}
              aria-label={`Vender ${holding.symbol}`}
            >
              <MinusCircle className="w-4 h-4 text-red-500" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Eliminar ${holding.symbol}`}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el activo <strong>{holding.symbol}</strong> y todo su historial de
                    transacciones. No podrás deshacerlo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteAsset(holding.symbol)}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [onAddMore, onSell, onDeleteAsset]);

  const table = useReactTable({
    data: holdings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (holdings.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-muted-foreground">Aún no tienes posiciones abiertas.</p>
        <p className="body-sm text-muted-foreground mt-2">Agrega tu primera transacción desde el Dashboard.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posiciones Abiertas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === 'actions' ? 'text-left' : ''}
                    >
                      {header.isPlaceholder ? null : (
                        <Button
                          variant="ghost"
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                          className="hover:bg-transparent"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ▲',
                            desc: ' ▼',
                          }[header.column.getIsSorted() as string] ?? null}
                        </Button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'actions' ? '' : ' pl-6 text-left'}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});