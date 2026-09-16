// src/hooks/useNotifications.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

// ============================================================
// TYPES
// ============================================================
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
}

interface UseNotificationsOptions {
  fetcher?: () => Promise<unknown>;
  pollInterval?: number;
  eventName?: string;
}

// ============================================================
// HELPER — Normalise la réponse en tableau
// ============================================================
function normalizeNotifications(raw: unknown): Notification[] {
  if (!raw) return [];

  // ✅ Cas 1 : déjà un tableau
  if (Array.isArray(raw)) return raw as Notification[];

  // ✅ Cas 2 : objet avec clé "data"
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as Notification[];
    if (Array.isArray(obj.notifications))
      return obj.notifications as Notification[];
    if (Array.isArray(obj.items)) return obj.items as Notification[];
    if (Array.isArray(obj.results)) return obj.results as Notification[];

    // Cas 2b : objet paginé { data: { notifications: [...] } }
    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.notifications))
        return nested.notifications as Notification[];
      if (Array.isArray(nested.items)) return nested.items as Notification[];
    }
  }

  // ⚠️ Rien de reconnu → tableau vide
  console.warn('[useNotifications] Format inattendu:', raw);
  return [];
}

// ============================================================
// HOOK
// ============================================================
export function useNotifications({
  fetcher,
  pollInterval = 30_000,
  eventName = 'notification',
}: UseNotificationsOptions = {}) {
  const { on, off, isConnected } = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Chargement initial REST ───
  useEffect(() => {
    if (!fetcher) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const raw = await fetcher();
        const data = normalizeNotifications(raw);
        if (!cancelled) setNotifications(data);
      } catch (err) {
        console.error('[useNotifications] fetch:', err);
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  // ─── Live socket ───
  useEffect(() => {
    if (!isConnected) return;

    const handleNew = (n: Notification) => {
      if (!n || !n.id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        if (arr.some((x) => x.id === n.id)) return arr;
        return [n, ...arr];
      });
    };

    const handleUpdate = (n: Partial<Notification> & { id: string }) => {
      if (!n?.id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map((x) => (x.id === n.id ? { ...x, ...n } : x));
      });
    };

    const handleDelete = ({ id }: { id: string }) => {
      if (!id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter((x) => x.id !== id);
      });
    };

    on(eventName, handleNew);
    on(`${eventName}:update`, handleUpdate);
    on(`${eventName}:delete`, handleDelete);
    on('notification:receive', handleNew); // alias
    on('notification:updated', handleUpdate);
    on('notification:delete', handleDelete);

    return () => {
      off(eventName, handleNew);
      off(`${eventName}:update`, handleUpdate);
      off(`${eventName}:delete`, handleDelete);
      off('notification:receive', handleNew);
      off('notification:updated', handleUpdate);
      off('notification:delete', handleDelete);
    };
  }, [isConnected, eventName, on, off]);

  // ─── Polling fallback si socket down ───
  useEffect(() => {
    if (isConnected || !fetcher || pollInterval <= 0) return;

    const interval = setInterval(async () => {
      try {
        const raw = await fetcher();
        setNotifications(normalizeNotifications(raw));
      } catch {
        /* ignore */
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [isConnected, fetcher, pollInterval]);

  // ─── Actions ───
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter((n) => n.id !== id);
    });
  }, []);

  // ─── Sécurité : toujours un tableau ───
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  return {
    notifications: safeNotifications,
    loading,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
  };
}