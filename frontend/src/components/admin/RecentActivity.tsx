// src/components/admin/RecentActivity.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboard } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';

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

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await dashboard.getActivities({ limit: 5 });
        const rawData = response?.data?.data || response?.data || [];
        const normalized = Array.isArray(rawData)
          ? rawData.map((item: any) => ({
              ...item,
              user: item.user || null,
            }))
          : [];
        setActivities(normalized);
      } catch (error) {
        console.error('Erreur chargement activités:', error);
        toast.error('Impossible de charger les activités');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // ✅ Helper qui retourne une chaîne, jamais un objet
  const getUserName = (user: ActivityItem['user']) => {
    if (!user) return 'Utilisateur inconnu';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || 'Utilisateur';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg">Activités récentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Aucune activité récente</p>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="mt-0.5 rounded-full bg-secondary/10 p-1.5 text-secondary">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{getUserName(activity.user)}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.action || 'action'}</span>
                  {' '}
                  <span className="font-medium">{activity.resource || ''}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}