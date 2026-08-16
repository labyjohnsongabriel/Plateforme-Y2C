'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Users, GraduationCap, CalendarCheck, UsersRound, DollarSign, Briefcase, Activity as ActivityIcon, FileText } from 'lucide-react';
import { StatCard } from './StatCard';

// Types
interface ChartData {
  month: string;
  inscriptions: number;
  formations: number;
  y2c: number;
}

interface RoleData {
  name: string;
  value: number;
}

interface StatsSummary {
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
}

interface ChartsSectionProps {
  stats?: {
    chartData?: ChartData[];
    roleData?: RoleData[];
    summary?: StatsSummary;
  };
  loading?: boolean;
}

const COLORS = ['#010B40', '#1a2b5c', '#F13544', '#f55a67', '#6b7280'];

export function ChartsSection({ stats, loading }: ChartsSectionProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Extraire les données des props
  const chartData: ChartData[] = stats?.chartData || [];
  const roleData: RoleData[] = stats?.roleData || [];
  const summary: StatsSummary | undefined = stats?.summary;

  const hasChartData = chartData.length > 0;
  const hasRoleData = roleData.length > 0;

  // Cartes récapitulatives (si summary existe)
  const summaryCards = summary ? [
    { title: 'Utilisateurs', value: summary.totalUsers, icon: <Users className="h-5 w-5" />, color: 'primary' as const },
    { title: 'Formations', value: summary.totalFormations, icon: <GraduationCap className="h-5 w-5" />, color: 'secondary' as const },
    { title: 'Membres Y2C', value: summary.totalY2CMembers, icon: <UsersRound className="h-5 w-5" />, color: 'success' as const },
    { title: 'Inscriptions', value: summary.totalRegistrations, icon: <CalendarCheck className="h-5 w-5" />, color: 'info' as const },
    { title: 'Projets', value: summary.totalProjects, icon: <Briefcase className="h-5 w-5" />, color: 'secondary' as const },
    { title: 'Événements', value: summary.totalEvents, icon: <ActivityIcon className="h-5 w-5" />, color: 'info' as const },
    { title: 'Articles', value: summary.totalArticles, icon: <FileText className="h-5 w-5" />, color: 'primary' as const },
    { title: 'Revenu (Ar)', value: summary.revenue, icon: <DollarSign className="h-5 w-5" />, color: 'success' as const },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Cartes récapitulatives */}
      {summaryCards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, index) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              loading={false}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {/* Graphiques */}
      <Tabs defaultValue="inscriptions" className="w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
            <TabsTrigger value="formations">Formations</TabsTrigger>
            <TabsTrigger value="y2c">Communauté Y2C</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeriod('7d')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                period === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              7j
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                period === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              30j
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                period === '90d' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              )}
            >
              90j
            </button>
          </div>
        </div>

        {!hasChartData ? (
          <div className="mt-4 flex h-72 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">Aucune donnée de graphique disponible</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Les données seront affichées ici une fois disponibles
              </p>
            </div>
          </div>
        ) : (
          <>
            <TabsContent value="inscriptions" className="mt-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-4">Évolution des inscriptions</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="inscriptions"
                        stroke="#010B40"
                        fill="#010B40"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="formations" className="mt-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-4">Formations par mois</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="formations" fill="#F13544" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="y2c" className="mt-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-4">Évolution des membres Y2C</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="y2c"
                        stroke="#010B40"
                        strokeWidth={2}
                        dot={{ fill: '#010B40' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Répartition des rôles */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Répartition des rôles</h3>
        {!hasRoleData ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">Aucune donnée de répartition disponible</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Les données seront affichées ici une fois disponibles
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  );
}