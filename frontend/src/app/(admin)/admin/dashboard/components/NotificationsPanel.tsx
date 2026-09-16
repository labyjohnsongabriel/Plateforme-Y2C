// src/app/(admin)/admin/dashboard/components/NotificationsPanel.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  ChevronRight,
  BellOff,
  Wifi,
  WifiOff,
  Trash2,
} from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocket } from '@/hooks/useSocket';
import type { Notification } from '@/hooks/useNotifications';

// ============================================================
// TYPES & CONFIG
// ============================================================
interface NotificationsPanelProps {
  /** Fetcher REST pour les notifs initiales (optionnel) */
  fetcher?: () => Promise<Notification[]>;
  /** Nom de l'événement socket (défaut: 'notification') */
  eventName?: string;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const typeColors = {
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  error: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

// ============================================================
// COMPOSANT
// ============================================================
export function NotificationsPanel({
  fetcher,
  eventName = 'notification',
}: NotificationsPanelProps) {
  const router = useRouter();
  const { connected } = useSocket();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotifications({ fetcher, eventName });

  const [showAll, setShowAll] = useState(false);
  const displayNotifications = showAll ? notifications : notifications.slice(0, 4);

  // ─── Loading ───
  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
        {/* ─── HEADER ─── */}
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="h-5 px-1.5 text-[10px] font-bold"
              >
                {unreadCount}
              </Badge>
            )}
            {/* 🟢 Statut socket */}
            <span
              title={connected ? 'Temps réel actif' : 'Hors ligne'}
              className={cn(
                'ml-1 flex h-2 w-2 rounded-full',
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              )}
            />
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs"
              >
                Tout lire
              </Button>
            )}
            {notifications.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="h-7 px-2 text-xs"
              >
                {showAll ? 'Moins' : 'Voir tout'}
                <ChevronRight
                  className={cn(
                    'ml-1 h-3 w-3 transition-transform',
                    showAll && 'rotate-90'
                  )}
                />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* ─── BODY ─── */}
        <CardContent className="p-0">
          <ScrollArea className="h-[220px]">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <BellOff className="h-8 w-8 opacity-40" />
                <p className="mt-2 text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                <AnimatePresence initial={false}>
                  {displayNotifications.map((notification, index) => {
                    const Icon = notification.type
                      ? typeIcons[notification.type] || Bell
                      : Bell;
                    const colorClass = notification.type
                      ? typeColors[notification.type] ||
                        'bg-gray-500/10 text-gray-500'
                      : 'bg-gray-500/10 text-gray-500';

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          'group relative flex cursor-pointer items-start gap-3 p-3 transition-colors',
                          !notification.read
                            ? 'bg-secondary/5 hover:bg-secondary/10'
                            : 'hover:bg-muted/40'
                        )}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                          if (notification.link) router.push(notification.link);
                        }}
                      >
                        {/* Icône / Avatar */}
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            colorClass
                          )}
                        >
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate text-sm',
                              !notification.read ? 'font-semibold' : 'font-medium'
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/70">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Dot non lu + Delete */}
                        <div className="flex flex-col items-center gap-1">
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(notification.id);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}