import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Notification } from '@/types';
import { dashboard } from '@/lib/api';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================
interface NotificationState {
  // État
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions de base
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  addMultipleNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;

  // Action de chargement asynchrone (appelée depuis un composant)
  loadNotifications: (limit?: number) => Promise<void>;
}

// ============================================================
// STORE
// ============================================================
export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        // ---- État initial ----
        notifications: [],
        unreadCount: 0,
        isLoading: false,

        // ---- Actions ----
        setNotifications: (notifications: Notification[]) => {
          set({
            notifications: notifications.slice(0, 100),
            unreadCount: notifications.filter((n) => !n.isRead).length,
          });
        },

        addNotification: (notification: Notification) => {
          set((state) => {
            const updated = [notification, ...state.notifications].slice(0, 100);
            return {
              notifications: updated,
              unreadCount: state.unreadCount + 1,
            };
          });
        },

        addMultipleNotifications: (notifications: Notification[]) => {
          set((state) => {
            const merged = [...notifications, ...state.notifications];
            const limited = merged.slice(0, 100);
            const newUnread = notifications.filter((n) => !n.isRead).length;
            return {
              notifications: limited,
              unreadCount: state.unreadCount + newUnread,
            };
          });
        },

        markAsRead: (id: string) => {
          set((state) => {
            const updated = state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            );
            return {
              notifications: updated,
              unreadCount: updated.filter((n) => !n.isRead).length,
            };
          });
        },

        markAllAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          }));
        },

        removeNotification: (id: string) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        clearAll: () => {
          set({ notifications: [], unreadCount: 0 });
        },

        setUnreadCount: (count: number) => {
          set({ unreadCount: count });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // ---- Chargement asynchrone ----
        loadNotifications: async (limit = 20) => {
          const state = get();
          if (state.isLoading) return;
          set({ isLoading: true });
          try {
            const response = await dashboard.getNotifications({ limit });
            const data = response?.data?.data ?? response?.data ?? [];
            const notifications = Array.isArray(data) ? data : [];
            set({
              notifications: notifications.slice(0, 100),
              unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
            });
          } catch (error) {
            console.error('Erreur chargement notifications:', error);
            toast.error('Impossible de charger les notifications');
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'notification-storage', // clé localStorage
        partialize: (state) => ({
          // Persiste uniquement les 50 dernières notifications et le compteur
          notifications: state.notifications.slice(0, 50),
          unreadCount: state.unreadCount,
        }),
        skipHydration: true, // Important pour Next.js (évite les erreurs d'hydratation)
      }
    ),
    { name: 'NotificationStore' } // Nom pour devtools
  )
);