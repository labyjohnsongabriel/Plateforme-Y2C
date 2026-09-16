// src/hooks/useNotifications.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;         // 🖼️ image optionnelle
  userId?: string;         // émetteur
}

interface UseNotificationsOptions {
  /** Charge les notifs initiales (via API REST) */
  fetcher?: () => Promise<Notification[]>;
  /** Nom de l'événement socket écouté (défaut: 'notification') */
  eventName?: string;
}

export function useNotifications({
  fetcher,
  eventName = 'notification',
}: UseNotificationsOptions = {}) {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Chargement initial ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (fetcher) {
          const data = await fetcher();
          if (!cancelled) setNotifications(data);
        }
      } catch (err) {
        console.error('[useNotifications] fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  // ─── Écoute temps réel ───
  useEffect(() => {
    if (!socket) return;

    const handleNew = (notif: Notification) => {
      setNotifications((prev) => {
        // Éviter les doublons
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });

      // 🔔 Son optionnel (désactivable)
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}

      // 🌐 Notification navigateur
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(notif.title, { body: notif.message, icon: '/logo.png' });
      }
    };

    const handleUpdate = (notif: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, ...notif } : n))
      );
    };

    const handleDelete = ({ id }: { id: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    socket.on(eventName, handleNew);
    socket.on(`${eventName}:update`, handleUpdate);
    socket.on(`${eventName}:delete`, handleDelete);

    return () => {
      socket.off(eventName, handleNew);
      socket.off(`${eventName}:update`, handleUpdate);
      socket.off(`${eventName}:delete`, handleDelete);
    };
  }, [socket, eventName]);

  // ─── Actions ───
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      socket?.emit('notification:read', { id });
    },
    [socket]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    socket?.emit('notification:read-all');
  }, [socket]);

  const remove = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      socket?.emit('notification:delete', { id });
    },
    [socket]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
  };
}