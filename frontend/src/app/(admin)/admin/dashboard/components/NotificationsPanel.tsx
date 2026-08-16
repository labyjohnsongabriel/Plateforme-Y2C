// src/app/(admin)/admin/dashboard/components/NotificationsPanel.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  ChevronRight,
  BellOff,
} from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsPanelProps {
  notifications?: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const typeColors = {
  info: 'bg-blue-500/10 text-blue-500',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  error: 'bg-red-500/10 text-red-500',
};

// Données d'exemple (mock) – utilisées si aucune donnée n'est fournie
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouvelle inscription',
    message: "Jean Dupont s'est inscrit à la formation Next.js",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    type: 'info',
    link: '/admin/inscriptions',
  },
  {
    id: '2',
    title: 'Paiement reçu',
    message: 'Aina R. a payé sa cotisation Y2C (25 000 Ar)',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'success',
    link: '/admin/paiements',
  },
  {
    id: '3',
    title: 'Nouveau membre Y2C',
    message: 'Tiana F. a rejoint la communauté Y2C',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'info',
    link: '/admin/y2c/membres',
  },
  {
    id: '4',
    title: 'Formation à venir',
    message: 'La formation React Native démarre dans 3 jours',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'warning',
    link: '/admin/formations',
  },
];

export function NotificationsPanel({
  notifications = mockNotifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const displayNotifications = showAll ? notifications : notifications.slice(0, 4);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs h-7 px-2"
              >
                Tout lire
              </Button>
            )}
            {notifications.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-xs h-7 px-2"
              >
                {showAll ? 'Moins' : 'Voir tout'}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] pr-3">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <BellOff className="h-8 w-8" />
                <p className="mt-2 text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayNotifications.map((notification, index) => {
                  const Icon = notification.type
                    ? typeIcons[notification.type] || Bell
                    : Bell;
                  const colorClass = notification.type
                    ? typeColors[notification.type] || 'bg-gray-500/10 text-gray-500'
                    : 'bg-gray-500/10 text-gray-500';

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-start gap-3 rounded-lg p-2 transition-colors cursor-pointer',
                        !notification.read && 'bg-secondary/5 hover:bg-secondary/10',
                        notification.read && 'hover:bg-muted/30'
                      )}
                      onClick={() => {
                        if (!notification.read) handleMarkAsRead(notification.id);
                        if (notification.link) {
                          // Redirection (à implémenter avec router)
                        }
                      }}
                    >
                      <div className={cn('rounded-full p-1.5', colorClass)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}