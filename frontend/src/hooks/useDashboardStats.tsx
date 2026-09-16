'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalFormations: number;
    totalRegistrations: number;
    totalY2CMembers: number;
    totalPayments: number;
    totalProjects: number;
    totalEvents: number;
    totalArticles: number;
    revenue: number;
    pendingValidations: number;
    recentSignups: number;
  };
  realtime: {
    onlineUsers: number;
    todayVisits: number;
    activeSessions: number;
  };
  activities: Array<{
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
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  quickStats?: {
    activeUsers: number;
    newUsersToday: number;
    registrationsThisWeek: number;
    revenueThisMonth: number;
  };
  chartData?: Array<{
    month: string;
    inscriptions: number;
    formations: number;
    y2c: number;
  }>;
  roleData?: Array<{ name: string; value: number }>;
  timestamp: string;
}

const defaultStats: DashboardStats = {
  stats: {
    totalUsers: 0,
    totalFormations: 0,
    totalRegistrations: 0,
    totalY2CMembers: 0,
    totalPayments: 0,
    totalProjects: 0,
    totalEvents: 0,
    totalArticles: 0,
    revenue: 0,
    pendingValidations: 0,
    recentSignups: 0,
  },
  realtime: { onlineUsers: 0, todayVisits: 0, activeSessions: 0 },
  activities: [],
  notifications: [],
  timestamp: new Date().toISOString(),
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, quickRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/quick-stats'),
      ]);
      const rawData = statsRes?.data?.data || statsRes?.data || {};
      const quickRaw = quickRes?.data?.data || quickRes?.data || {};

      // ✅ Normalisation des activités : l'API renvoie "User" (majuscule)
      const rawActivities = Array.isArray(rawData.activities) ? rawData.activities : [];
      const normalizedActivities = rawActivities.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        resource: activity.resource,
        createdAt: activity.createdAt || activity.timestamp || new Date().toISOString(),
        // Transformation de "User" en "user"
        user: activity.User ? {
          id: activity.User.id,
          firstName: activity.User.firstName || '',
          lastName: activity.User.lastName || '',
          email: activity.User.email || '',
        } : null,
      }));

      const normalized: DashboardStats = {
        stats: {
          totalUsers: rawData.stats?.users?.total ?? rawData.stats?.totalUsers ?? 0,
          totalFormations: rawData.stats?.formations?.total ?? rawData.stats?.totalFormations ?? 0,
          totalRegistrations: rawData.stats?.registrations?.total ?? rawData.stats?.totalRegistrations ?? 0,
          totalY2CMembers: rawData.stats?.y2c?.total ?? rawData.stats?.totalY2CMembers ?? 0,
          totalPayments: rawData.stats?.payments?.total ?? rawData.stats?.totalPayments ?? 0,
          totalProjects: rawData.stats?.projects?.total ?? rawData.stats?.totalProjects ?? 0,
          totalEvents: rawData.stats?.events?.total ?? rawData.stats?.totalEvents ?? 0,
          totalArticles: rawData.stats?.articles?.total ?? rawData.stats?.totalArticles ?? 0,
          revenue:
            rawData.stats?.payments?.revenue ??
            rawData.stats?.revenue ??
            rawData.stats?.payments?.totalAmount ??
            0,
          pendingValidations:
            rawData.stats?.pendingValidations ?? rawData.stats?.contact?.unread ?? 0,
          recentSignups: rawData.stats?.recentSignups ?? 0,
        },
        quickStats: {
          activeUsers: quickRaw.activeUsers ?? 0,
          newUsersToday: quickRaw.newUsersToday ?? 0,
          registrationsThisWeek: quickRaw.registrationsThisWeek ?? 0,
          revenueThisMonth: quickRaw.revenueThisMonth ?? 0,
        },
        chartData: Array.isArray(rawData.chartData) ? rawData.chartData : [],
        roleData: Array.isArray(rawData.roleData) ? rawData.roleData : [],
        realtime: {
          onlineUsers: rawData.realtime?.activeUsers ?? rawData.realtime?.onlineUsers ?? 0,
          todayVisits: rawData.realtime?.todayVisits ?? 0,
          activeSessions: rawData.realtime?.activeSessions ?? 0,
        },
        activities: normalizedActivities,
        notifications: Array.isArray(rawData.notifications)
          ? rawData.notifications.map((n: any) => ({
              id: n.id,
              title: n.title || 'Notification',
              message: n.message || '',
              read: n.isRead ?? n.read ?? false,
              createdAt: n.createdAt || new Date().toISOString(),
              link: n.link || undefined,
              type: n.type || 'info',
            }))
          : [],
        timestamp: rawData.timestamp || new Date().toISOString(),
      };

      setStats(normalized);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Erreur de chargement des statistiques';
      setError(message);
      toast.error(message);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}