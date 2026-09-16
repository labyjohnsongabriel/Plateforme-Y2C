// src/app/(admin)/admin/dashboard/components/QuickActions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  GraduationCap,
  UsersRound,
  CalendarPlus,
  FileText,
  Mail,
  DollarSign,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export function QuickActions() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      label: 'Ajouter un utilisateur',
      icon: <UserPlus className="h-4 w-4" />,
      href: '/admin/utilisateurs?action=add',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:text-blue-400',
    },
    {
      label: 'Créer une formation',
      icon: <GraduationCap className="h-4 w-4" />,
      href: '/admin/formations/nouveau',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-400',
    },
    {
      label: 'Gérer Y2C',
      icon: <UsersRound className="h-4 w-4" />,
      href: '/admin/y2c/membres',
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 dark:text-purple-400',
    },
    {
      label: 'Nouvel événement',
      icon: <CalendarPlus className="h-4 w-4" />,
      href: '/admin/evenements/nouveau',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20 dark:text-cyan-400',
    },
    {
      label: 'Rédiger un article',
      icon: <FileText className="h-4 w-4" />,
      href: '/admin/articles/nouveau',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400',
    },
    {
      label: 'Voir les messages',
      icon: <Mail className="h-4 w-4" />,
      href: '/admin/messages',
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 dark:text-rose-400',
    },
    {
      label: 'Gérer les paiements',
      icon: <DollarSign className="h-4 w-4" />,
      href: '/admin/paiements',
      color: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:text-green-400',
    },
    {
      label: 'Paramètres',
      icon: <Settings className="h-4 w-4" />,
      href: '/admin/parametres',
      color: 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20 dark:text-gray-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 font-ubuntu text-base font-semibold">
            <span>⚡ Actions rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => router.push(action.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md',
                  action.color
                )}
              >
                <div className="rounded-full bg-background/60 p-1.5">
                  {action.icon}
                </div>
                <span className="text-xs font-medium leading-tight">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}