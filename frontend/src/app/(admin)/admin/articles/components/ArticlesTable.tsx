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
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  publishedAt?: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArticlesTableProps {
  data: Article[];
  loading?: boolean;
  onEdit: (article: Article) => void;
  onDelete?: (article: Article) => Promise<void>;
}

// ─── Configuration des statuts ────────────────────────────
const statusConfig: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  },
  PUBLISHED: {
    label: 'Publié',
    className: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  },
  ARCHIVED: {
    label: 'Archivé',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
  SCHEDULED: {
    label: 'Programmé',
    className: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
};

// ─── Composant ──────────────────────────────────────────────
export function ArticlesTable({ data, loading = false, onEdit, onDelete }: ArticlesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (article: Article) => {
    setDeleteTarget(article);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Article supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Article>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category}</Badge>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status as ArticleStatus;
        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
          <Badge
            variant="secondary"
            className={cn('font-medium capitalize', config.className)}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'views',
      accessorKey: 'views',
      header: 'Vues',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.views}</span>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const article = row.original;
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
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(article)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(article)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
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
        searchPlaceholder="Rechercher un article..."
        loading={loading}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’article{' '}
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