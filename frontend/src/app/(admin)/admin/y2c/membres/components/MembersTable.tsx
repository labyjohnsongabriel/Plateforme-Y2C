'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Clock,
  RefreshCw,
  BadgeCheck,
  BadgeAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTable } from '@/components/admin/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/user.types';
import { api } from '@/lib/api';
import { Y2CMember, Y2CMemberStatus } from '@/types/y2c.types';

interface MemberWithAvatar extends Y2CMember {
  avatar?: string;
}

export type { Y2CMember, Y2CMemberStatus };

interface MembersTableProps {
  data: MemberWithAvatar[];
  loading?: boolean;
  onMemberUpdated?: () => void;
  onEdit: (member: MemberWithAvatar) => void;
  onDelete?: (member: MemberWithAvatar) => Promise<void>;
  onGenerateBadge?: (member: MemberWithAvatar) => Promise<void>;
}

// ─── Configuration des statuts ──────────────────────────────
const statusConfig: Record<
  Y2CMemberStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ACTIVE: {
    label: 'Actif',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  INACTIVE: {
    label: 'Inactif',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  EXPIRED: {
    label: 'Expiré',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  PENDING: {
    label: 'En attente',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

export function MembersTable({
  data,
  loading = false,
  onMemberUpdated,
  onEdit,
  onDelete,
  onGenerateBadge,
}: MembersTableProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;

  const [deleteTarget, setDeleteTarget] = useState<MemberWithAvatar | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Rafraîchissement ──────────────────────────────────────
  const refetchMembers = () => {
    onMemberUpdated?.();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchMembers();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('✅ Liste actualisée');
  };

  // ─── Actions ──────────────────────────────────────────────
  const handleDelete = async (member: MemberWithAvatar) => {
    setDeleteTarget(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(deleteTarget);
      } else {
        await api.delete(`/y2c/members/${deleteTarget.id}`);
      }
      toast.success(`🗑️ ${deleteTarget.name} supprimé`);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      refetchMembers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateBadge = async (member: MemberWithAvatar) => {
    // Vérification robuste pour éviter de générer un badge déjà existant
    if (member.badgeNumber && member.badgeNumber.trim() !== '') {
      toast.info('Badge déjà généré');
      return;
    }
    setGeneratingId(member.id);
    try {
      if (onGenerateBadge) {
        await onGenerateBadge(member);
      } else {
        await api.post(`/y2c/members/${member.id}/generate-badge`);
      }
      toast.success(`✅ Badge généré pour ${member.name}`);
      refetchMembers();
    } catch (error) {
      toast.error('Erreur lors de la génération du badge');
    } finally {
      setGeneratingId(null);
    }
  };

  // ─── Colonnes ──────────────────────────────────────────────
  const columns: ColumnDef<MemberWithAvatar>[] = [
    {
      id: 'name',
      header: 'Nom',
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        const member = row.original;
        const initials = member.name
          .split(' ')
          .map((n) => n.charAt(0).toUpperCase())
          .join('');
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/5 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'badgeNumber',
      accessorKey: 'badgeNumber',
      header: 'Badge',
      cell: ({ row }) => {
        const member = row.original;
        // Vérification robuste : badge présent si non null, non undefined et non vide
        const hasBadge = member.badgeNumber != null && member.badgeNumber.trim() !== '';
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1.5 font-medium text-[10px] uppercase',
                    hasBadge
                      ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  )}
                >
                  {hasBadge ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {member.badgeNumber}
                    </>
                  ) : (
                    <>
                      <BadgeAlert className="h-3.5 w-3.5" />
                      Non généré
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {hasBadge ? 'Badge généré' : 'Badge non généré'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: 'institution',
      accessorKey: 'institution',
      header: 'Institution',
      cell: ({ row }) => row.original.institution || '—',
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Badge variant="outline" className={cn('gap-1.5 font-medium text-[10px] uppercase', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Inscrit le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const member = row.original;
        const isLoading = generatingId === member.id;
        // Vérification robuste de la présence du badge
        const hasBadge = member.badgeNumber != null && member.badgeNumber.trim() !== '';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  {member.name}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onEdit(member)} className="gap-2">
                <Edit className="h-4 w-4 text-blue-500" />
                Modifier
              </DropdownMenuItem>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DropdownMenuItem
                        onClick={() => handleGenerateBadge(member)}
                        disabled={isLoading || hasBadge}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : hasBadge ? (
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <BadgeAlert className="h-4 w-4 text-amber-500" />
                        )}
                        {hasBadge ? 'Badge déjà généré' : 'Générer le badge'}
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>
                  {hasBadge && (
                    <TooltipContent side="left">
                      Ce membre possède déjà un badge
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(member)}
                className="gap-2 text-destructive focus:text-destructive"
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
    <TooltipProvider>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Rechercher un membre..."
        loading={loading || isRefreshing}
        addButtonLabel="Ajouter un membre"
        onAdd={() => {
          // Le parent gère l'ouverture du formulaire
        }}
        onRefresh={handleRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le membre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}