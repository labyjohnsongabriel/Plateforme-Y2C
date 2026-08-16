'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reply } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function MessagesTable({ data, loading }: any) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'subject',
      header: 'Sujet',
    },
    {
      accessorKey: 'isRead',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={row.original.isRead ? 'secondary' : 'success'}>
          {row.original.isRead ? 'Lu' : 'Non lu'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="gap-2">
          <Reply className="h-4 w-4" />
          Répondre
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="email"
      searchPlaceholder="Rechercher un message..."
    />
  );
}