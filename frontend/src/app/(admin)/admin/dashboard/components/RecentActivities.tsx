// src/app/(admin)/admin/dashboard/components/RecentActivities.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
export type ActivityItem = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;   // 🖼️ URL image
  } | null;
};

interface RecentActivitiesProps {
  activities?: ActivityItem[];
  loading?: boolean;
  /** Limite d'affichage (défaut: illimité) */
  limit?: number;
}

// ============================================================
// UTILS
// ============================================================
const getFullName = (user: ActivityItem['user']) => {
  if (!user) return 'Utilisateur inconnu';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.email || 'Utilisateur';
};

const getInitials = (user: ActivityItem['user']) => {
  if (!user) return '?';
  const f = user.firstName?.charAt(0) || '';
  const l = user.lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
};

// Couleur de secours déterministe (basée sur l'ID)
const getFallbackColor = (userId?: string) => {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-pink-500',
  ];
  if (!userId) return 'bg-muted';
  const idx =
    userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
};

// ============================================================
// COMPOSANT
// ============================================================
export function RecentActivities({
  activities = [],
  loading = false,
  limit,
}: RecentActivitiesProps) {
  const list = limit ? activities.slice(0, limit) : activities;

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 font-ubuntu text-sm font-semibold">
            <Activity className="h-4 w-4 text-secondary" />
            Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
        <CardTitle className="flex items-center gap-2 font-ubuntu text-sm font-semibold">
          <Activity className="h-4 w-4 text-secondary" />
          Activités récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune activité récente
            </p>
          </div>
        ) : (
          list.map((activity, index) => {
            const userName = getFullName(activity.user);
            const initials = getInitials(activity.user);
            const fallbackColor = getFallbackColor(activity.user?.id);

            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-border/60 hover:bg-muted/30"
              >
                {/* 🖼️ Avatar avec image + fallback initiales */}
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                  {activity.user?.avatar && (
                    <AvatarImage
                      src={activity.user.avatar}
                      alt={userName}
                      loading="lazy"
                    />
                  )}
                  <AvatarFallback
                    className={cn(
                      'text-xs font-semibold text-white',
                      fallbackColor
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Contenu */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold text-foreground">
                      {userName}
                    </span>
                    <span className="mx-1.5 text-muted-foreground/60">•</span>
                    <span className="capitalize text-muted-foreground">
                      {activity.action?.toLowerCase() || 'action'}
                    </span>
                    {activity.resource && (
                      <>
                        <span className="mx-1.5 text-muted-foreground/60">•</span>
                        <span className="font-medium text-foreground/85">
                          {activity.resource}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
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