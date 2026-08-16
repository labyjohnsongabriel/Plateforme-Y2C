'use client';

import {
  Users,
  GraduationCap,
  CalendarCheck,
  UsersRound,
  DollarSign,
  Briefcase,
  FileText,
  Activity,
  Clock,
  UserCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsOverviewProps {
  stats?: {
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
  loading?: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  // Valeurs par défaut
  const s = stats || {
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
  };

  // Formatage des nombres
  const formatNumber = (value: number): string => {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'k';
    return value.toString();
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('fr-MG') + ' Ar';
  };

  // Définition des cartes avec leurs métadonnées
  const cards = [
    {
      title: 'Utilisateurs',
      value: s.totalUsers,
      formatted: formatNumber(s.totalUsers),
      icon: <Users className="h-5 w-5" />,
      trend: 8,
      trendLabel: '+8% ce mois',
      color: 'primary' as const,
      description: 'Comptes actifs',
    },
    {
      title: 'Formations',
      value: s.totalFormations,
      formatted: formatNumber(s.totalFormations),
      icon: <GraduationCap className="h-5 w-5" />,
      trend: 3,
      trendLabel: '+3 nouvelles',
      color: 'secondary' as const,
      description: 'Cours disponibles',
    },
    {
      title: 'Inscriptions',
      value: s.totalRegistrations,
      formatted: formatNumber(s.totalRegistrations),
      icon: <CalendarCheck className="h-5 w-5" />,
      trend: 12,
      trendLabel: '+12% ce mois',
      color: 'info' as const,
      description: 'Total des inscriptions',
    },
    {
      title: 'Membres Y2C',
      value: s.totalY2CMembers,
      formatted: formatNumber(s.totalY2CMembers),
      icon: <UsersRound className="h-5 w-5" />,
      trend: 5,
      trendLabel: '+5 nouveaux',
      color: 'success' as const,
      description: 'Communauté active',
    },
    {
      title: 'Paiements',
      value: s.totalPayments,
      formatted: formatNumber(s.totalPayments),
      icon: <DollarSign className="h-5 w-5" />,
      trend: 7,
      trendLabel: '+7%',
      color: 'warning' as const,
      description: 'Transactions réussies',
    },
    {
      title: 'Projets',
      value: s.totalProjects,
      formatted: formatNumber(s.totalProjects),
      icon: <Briefcase className="h-5 w-5" />,
      trend: 2,
      trendLabel: '+2 en cours',
      color: 'secondary' as const,
      description: 'Projets actifs',
    },
    {
      title: 'Événements',
      value: s.totalEvents,
      formatted: formatNumber(s.totalEvents),
      icon: <Activity className="h-5 w-5" />,
      trend: 0,
      trendLabel: 'Aucun à venir',
      color: 'info' as const,
      description: 'Programmés',
    },
    {
      title: 'Articles',
      value: s.totalArticles,
      formatted: formatNumber(s.totalArticles),
      icon: <FileText className="h-5 w-5" />,
      trend: 4,
      trendLabel: '+4 publiés',
      color: 'primary' as const,
      description: 'Contenu éditorial',
    },
    {
      title: 'Revenu',
      value: s.revenue,
      formatted: formatCurrency(s.revenue),
      icon: <DollarSign className="h-5 w-5" />,
      trend: 15,
      trendLabel: '+15%',
      color: 'success' as const,
      description: 'Total des paiements',
    },
    {
      title: 'En attente',
      value: s.pendingValidations,
      formatted: formatNumber(s.pendingValidations),
      icon: <Clock className="h-5 w-5" />,
      trend: -2,
      trendLabel: '-2 en attente',
      color: 'warning' as const,
      description: 'Validations requises',
    },
    {
      title: 'Nouveaux inscrits',
      value: s.recentSignups,
      formatted: formatNumber(s.recentSignups),
      icon: <UserCheck className="h-5 w-5" />,
      trend: 20,
      trendLabel: '+20 cette semaine',
      color: 'success' as const,
      description: '7 derniers jours',
    },
  ];

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.formatted} // ← affiche la valeur formatée
          icon={card.icon}
          trend={card.trend}
          trendLabel={card.trendLabel}
          description={card.description}
          color={card.color}
          loading={false}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}