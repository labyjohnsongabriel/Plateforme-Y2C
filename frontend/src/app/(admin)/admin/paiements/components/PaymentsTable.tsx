'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAID: 'bg-green-500/10 text-green-500',
  FAILED: 'bg-red-500/10 text-red-500',
  REFUNDED: 'bg-gray-500/10 text-gray-500',
  PARTIAL: 'bg-blue-500/10 text-blue-500',
};

export function PaymentsTable({ data, loading }: any) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'paymentReference',
      header: 'Référence',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.paymentReference}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Méthode',
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
      accessorKey: 'paidAt',
      header: 'Date paiement',
      cell: ({ row }) => (row.original.paidAt ? formatDate(row.original.paidAt) : 'En attente'),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date création',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="paymentReference"
      searchPlaceholder="Rechercher une référence..."
    />
  );
}