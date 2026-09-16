// src/app/(admin)/admin/dashboard/components/StatsOverview.tsx
'use client';

import {
  Users,
  GraduationCap,
  UsersRound,
  CalendarCheck,
  Briefcase,
  Activity as ActivityIcon,
  FileText,
  DollarSign,
} from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsOverviewProps {
  stats?: {
    totalUsers: number;
    totalFormations: number;
    totalRegistrations: number;
    totalY2CMembers: number;
    totalProjects: number;
    totalEvents: number;
    totalArticles: number;
    revenue: number;
    recentSignups?: number;
    pendingValidations?: number;
  };
  loading?: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (!stats) return null;

  // 🎯 Données + design premium de chaque card
  const cards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: 'primary' as const,
      trend: 8,
      description: `${stats.recentSignups ?? 0} nouveaux ce mois`,
      // Sparkline mock (à remplacer par data backend)
      sparkline: [3, 5, 4, 7, 6, 9, stats.totalUsers],
    },
    {
      title: 'Formations',
      value: stats.totalFormations,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: 3,
      description: `${stats.totalFormations} au total`,
      progress: Math.min((stats.totalFormations / 10) * 100, 100),
    },
    {
      title: 'Inscriptions',
      value: stats.totalRegistrations,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: 'info' as const,
      trend: 12,
      description: `${stats.pendingValidations ?? 0} en attente`,
      breakdown: [
        { label: 'Validées', value: stats.totalRegistrations - (stats.pendingValidations ?? 0), color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'En attente', value: stats.pendingValidations ?? 0, color: 'text-amber-600 dark:text-amber-400' },
      ],
    },
    {
      title: 'Membres Y2C',
      value: stats.totalY2CMembers,
      icon: <UsersRound className="h-5 w-5" />,
      color: 'success' as const,
      trend: 5,
      description: `${stats.totalY2CMembers} membres actifs`,
      sparkline: [1, 2, 2, 3, 3, 3, stats.totalY2CMembers],
    },
    {
      title: 'Événements',
      value: stats.totalEvents,
      icon: <ActivityIcon className="h-5 w-5" />,
      color: 'info' as const,
      trend: 2,
      description: 'à venir',
    },
    {
      title: 'Projets',
      value: stats.totalProjects,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: 2,
      description: 'en cours',
      progress: 65,
    },
    {
      title: 'Articles',
      value: stats.totalArticles,
      icon: <FileText className="h-5 w-5" />,
      color: 'primary' as const,
      trend: 4,
      description: 'publiés ce trimestre',
    },
    {
      title: 'Revenu',
      value: stats.revenue,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'success' as const,
      format: 'currency' as const,
      currency: 'MGA',
      suffix: ' Ar',
      trend: 15,
      description: 'ce mois',
      sparkline: [120, 180, 150, 220, 200, 250, 270],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          {...card}
          loading={loading}
          delay={index}
        />
      ))}
    </div>
  );
}