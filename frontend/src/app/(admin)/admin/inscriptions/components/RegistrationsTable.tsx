'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  CONFIRMED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
  COMPLETED: 'bg-blue-500/10 text-blue-500',
};

const paymentColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAID: 'bg-green-500/10 text-green-500',
  FAILED: 'bg-red-500/10 text-red-500',
  REFUNDED: 'bg-gray-500/10 text-gray-500',
};

export function RegistrationsTable({ data, loading }: { data: any[]; loading: boolean }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'firstName',
      header: 'Nom',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'formation',
      header: 'Formation',
      cell: ({ row }) => row.original.formation?.title || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status] || ''}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Paiement',
      cell: ({ row }) => (
        <Badge className={paymentColors[row.original.paymentStatus] || ''}>
          {row.original.paymentStatus}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="email"
      searchPlaceholder="Rechercher par email..."
    />
  );
}