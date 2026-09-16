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

// ============================================================
// TYPES
// ============================================================
export interface StatsOverviewData {
  totalUsers: number;
  totalFormations: number;
  totalRegistrations: number;
  totalY2CMembers: number;
  totalProjects: number;
  totalEvents: number;
  totalArticles: number;
  revenue: number;
  // ─── Enrichissements optionnels ───
  recentSignups?: number;
  pendingValidations?: number;
  trends?: {
    users?: number;
    formations?: number;
    registrations?: number;
    y2c?: number;
    events?: number;
    projects?: number;
    articles?: number;
    revenue?: number;
  };
  sparklines?: {
    users?: number[];
    y2c?: number[];
    revenue?: number[];
  };
  // ─── Options pour Progress ───
  capacity?: {
    formations?: number;   // Objectif / capacité (ex: 20)
    projects?: number;     // Total visé (ex: 10)
  };
}

interface StatsOverviewProps {
  stats?: StatsOverviewData;
  loading?: boolean;
}

// ============================================================
// COMPOSANT
// ============================================================
export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (!stats && !loading) return null;

  // ─── Helpers ───
  const t = stats?.trends || {};
  const c = stats?.capacity || {};
  const s = stats?.sparklines || {};

  const safeProgress = (current: number, max?: number) => {
    if (!max || max <= 0) return undefined;
    return Math.min((current / max) * 100, 100);
  };

  const validSparkline = (data?: number[]) =>
    data && data.length > 1 ? data : undefined;

  const cards = [
    // ─── Utilisateurs ───
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: 'primary' as const,
      trend: t.users,
      description:
        (stats?.recentSignups ?? 0) > 0
          ? `+${stats?.recentSignups} ce mois`
          : 'Aucun nouveau',
      sparkline: validSparkline(s.users),
    },

    // ─── Formations ───
    {
      title: 'Formations',
      value: stats?.totalFormations ?? 0,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: t.formations,
      description: 'Formations actives',
      progress: safeProgress(stats?.totalFormations ?? 0, c.formations),
    },

    // ─── Inscriptions ───
    {
      title: 'Inscriptions',
      value: stats?.totalRegistrations ?? 0,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: 'info' as const,
      trend: t.registrations,
      description:
        (stats?.pendingValidations ?? 0) > 0
          ? `${stats?.pendingValidations} en attente`
          : 'Toutes validées',
      breakdown:
        (stats?.pendingValidations ?? 0) > 0
          ? [
              {
                label: 'Validées',
                value:
                  (stats?.totalRegistrations ?? 0) -
                  (stats?.pendingValidations ?? 0),
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'En attente',
                value: stats?.pendingValidations ?? 0,
                color: 'text-amber-600 dark:text-amber-400',
              },
            ]
          : undefined,
    },

    // ─── Membres Y2C ───
    {
      title: 'Membres Y2C',
      value: stats?.totalY2CMembers ?? 0,
      icon: <UsersRound className="h-5 w-5" />,
      color: 'success' as const,
      trend: t.y2c,
      description: 'Membres actifs',
      sparkline: validSparkline(s.y2c),
    },

    // ─── Événements ───
    {
      title: 'Événements',
      value: stats?.totalEvents ?? 0,
      icon: <ActivityIcon className="h-5 w-5" />,
      color: 'info' as const,
      trend: t.events,
      description: 'Événements programmés',
    },

    // ─── Projets ───
    {
      title: 'Projets',
      value: stats?.totalProjects ?? 0,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'secondary' as const,
      trend: t.projects,
      description: 'Projets en cours',
      progress: safeProgress(stats?.totalProjects ?? 0, c.projects),
    },

    // ─── Articles ───
    {
      title: 'Articles',
      value: stats?.totalArticles ?? 0,
      icon: <FileText className="h-5 w-5" />,
      color: 'primary' as const,
      trend: t.articles,
      description: 'Articles publiés',
    },

    // ─── Revenu ───
    {
      title: 'Revenu',
      value: stats?.revenue ?? 0,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'success' as const,
      format: 'currency' as const,
      currency: 'MGA',
      suffix: ' Ar',
      trend: t.revenue,
      description: 'Revenu total',
      sparkline: validSparkline(s.revenue),
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