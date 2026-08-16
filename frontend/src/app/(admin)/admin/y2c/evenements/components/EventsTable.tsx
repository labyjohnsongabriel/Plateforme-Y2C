'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn, formatDate } from '@/lib/utils';
import { MoreHorizontal, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export type Y2CEventType =
  | 'TRAINING'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'MEETUP'
  | 'TEAM_SETUP'
  | 'THREE_S'
  | 'TEAM_REALIZE'
  | 'COFFREDAY'
  | 'HACKATHON'
  | 'OTHER';

export interface Y2CEvent {
  id: string;
  title: string;
  description: string;
  eventType: Y2CEventType;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  isPaid: boolean;
  price?: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventsTableProps {
  data: Y2CEvent[];
  loading?: boolean;
  onEdit: (event: Y2CEvent) => void;
  onDelete: (event: Y2CEvent) => Promise<void>;
  onRefresh?: () => void;
}

const eventTypeConfig: Record<
  Y2CEventType,
  { label: string; className: string }
> = {
  TRAINING: {
    label: 'Formation',
    className: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  CONFERENCE: {
    label: 'Conférence',
    className: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  },
  WORKSHOP: {
    label: 'Atelier',
    className: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  },
  MEETUP: {
    label: 'Meetup',
    className: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  },
  TEAM_SETUP: {
    label: 'Team Set Up',
    className: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  THREE_S: {
    label: '3S',
    className: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  },
  TEAM_REALIZE: {
    label: 'Team Realize',
    className: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  },
  COFFREDAY: {
    label: 'Coffreday',
    className: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  },
  HACKATHON: {
    label: 'Hackathon',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
  OTHER: {
    label: 'Autre',
    className: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  },
};

export function EventsTable({
  data,
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
}: EventsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Y2CEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDeleteClick = (event: Y2CEvent) => {
    setDeleteTarget(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      // L'erreur est gérée dans le parent
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const columns: ColumnDef<Y2CEvent>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      id: 'eventType',
      accessorKey: 'eventType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.eventType;
        const config = eventTypeConfig[type] || eventTypeConfig.OTHER;
        return (
          <Badge variant="secondary" className={cn('font-medium', config.className)}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Lieu',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.location}</span>
      ),
    },
    {
      id: 'isPublished',
      accessorKey: 'isPublished',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            'font-medium',
            row.original.isPublished
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
          )}
        >
          {row.original.isPublished ? 'Publié' : 'Brouillon'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/y2c/evenements/${event.id}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(event)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(event)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Rechercher un événement..."
        loading={loading || isRefreshing}
        addButtonLabel="Ajouter un événement"
        onAdd={() => {
          // Le parent gère l'ouverture du formulaire via le bouton "Nouvel événement"
        }}
        onRefresh={handleRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’événement{' '}
              <strong>{deleteTarget?.title}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}