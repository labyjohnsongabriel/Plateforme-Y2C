'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useToast } from './useToast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useSocket();
  const { success, info, warning, error } = useToast();

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Afficher un toast
    switch (notification.type) {
      case 'success':
        success(notification.message);
        break;
      case 'warning':
        warning(notification.message);
        break;
      case 'error':
        error(notification.message);
        break;
      default:
        info(notification.message);
    }

    return newNotification;
  }, [success, info, warning, error]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Écouter les notifications en temps réel via Socket.IO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (data: any) => {
      addNotification({
        title: data.title || 'Notification',
        message: data.message,
        type: data.type || 'info',
        link: data.link,
      });
    };

    socket.on('notification:receive', handleNotification);

    return () => {
      socket.off('notification:receive', handleNotification);
    };
  }, [socket, isConnected, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}