'use client';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { formatPrice, relativeDate } from '@assets/lib/utils';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { inferRouterOutputs } from '@trpc/server';
import { userRouter } from '@trpc/user-router';
import { LuArrowUpDown } from 'react-icons/lu';
import { Button } from '@ui/button';
import { useState } from 'react';
import Link from 'next/link';

type TPayments = Exclude<inferRouterOutputs<typeof userRouter>['getMyPayments'], null>;

const columns: ColumnDef<TPayments[0]>[] = [
  {
    accessorKey: 'transactionId',
    header: 'ID',
  },
  {
    accessorKey: '_count.products',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Products
          <LuArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'pricePaid',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Price Paid
          <LuArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue('pricePaid') as number;
      return formatPrice(price);
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Last Update
          <LuArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date;
      return relativeDate(date);
    },
  },
  {
    header: 'Details',
    cell: ({ row }) => {
      const transactionId = row.original.transactionId;
      return (
        <Button asChild size="icon">
          <Link href={`/me/payments/${transactionId}`}>
            <FaExternalLinkAlt />
          </Link>
        </Button>
      );
    },
  },
];

type TPaymentsTable = {
  payments: TPayments;
};
const PaymentsTable = ({ payments }: TPaymentsTable) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No payments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentsTable;
