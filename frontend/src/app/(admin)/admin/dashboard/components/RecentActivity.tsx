'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityItem = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

interface RecentActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities = [], loading = false }: RecentActivityProps) {
  // Obtenir le nom complet
  const getUserName = (user: ActivityItem['user']) => {
    if (!user) return 'Utilisateur inconnu';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return fullName || user.email || 'Utilisateur';
  };

  // Obtenir l'initiale
  const getInitial = (user: ActivityItem['user']) => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
  };

  // Couleur stable par utilisateur
  const getColor = (userId: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-indigo-500 text-white',
      'bg-teal-500 text-white',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          Activités récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Aucune activité récente</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const userName = getUserName(activity.user);
            const initial = getInitial(activity.user);
            const color = activity.user?.id ? getColor(activity.user.id) : 'bg-muted text-muted-foreground';

            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:border-secondary/30 hover:shadow-md transition-all duration-200"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium', color)}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{userName}</span>
                    <span className="text-muted-foreground mx-1.5">•</span>
                    <span className="text-muted-foreground capitalize">{activity.action?.toLowerCase() || 'action'}</span>
                    {activity.resource && (
                      <>
                        <span className="text-muted-foreground mx-1.5">•</span>
                        <span className="font-medium text-foreground/80">{activity.resource}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}