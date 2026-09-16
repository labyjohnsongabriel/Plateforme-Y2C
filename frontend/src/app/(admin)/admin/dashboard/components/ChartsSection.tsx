// src/app/(admin)/admin/dashboard/components/ChartsSection.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
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
  Legend,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  GraduationCap,
  UsersRound,
  Users,
  BarChart3,
  Award,
  Target,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export interface ChartData {
  month: string;
  inscriptions: number;
  formations: number;
  y2c: number;
}

export interface RoleData {
  name: string;
  value: number;
}

export interface ChartsSectionProps {
  stats?: {
    chartData?: ChartData[];
    roleData?: RoleData[];
  };
  loading?: boolean;
}

// ============================================================
// PALETTE PROFESSIONNELLE (charte Y2C)
// ============================================================
const COLORS = [
  '#010B40',
  '#F13544',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#6b7280',
];

// ============================================================
// TOOLTIP PREMIUM
// ============================================================
const PremiumTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border/60 bg-background/95 p-3 shadow-2xl backdrop-blur-md"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="capitalize text-muted-foreground">
              {entry.name}
            </span>
            <span className="ml-auto font-bold tabular-nums text-foreground">
              {Number(entry.value).toLocaleString('fr-FR')}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function ChartsSection({ stats, loading }: ChartsSectionProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const chartData: ChartData[] = stats?.chartData || [];
  const roleData: RoleData[] = stats?.roleData || [];

  const hasChartData = chartData.length > 0;
  const hasRoleData = roleData.length > 0;

  // ─── Filtre période ───
  const filteredChartData = useMemo(() => {
    const limit = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return chartData.slice(-Math.min(limit, chartData.length));
  }, [chartData, period]);

  // ─── Stats calculées ───
  const statsCalc = useMemo(() => {
    const data = filteredChartData;
    if (!data.length)
      return {
        inscriptions: { avg: 0, total: 0, last: 0, max: 0 },
        formations: { avg: 0, total: 0, last: 0, max: 0 },
        y2c: { avg: 0, total: 0, last: 0, max: 0 },
      };

    const calc = (key: keyof Omit<ChartData, 'month'>) => {
      const values = data.map((d) => d[key] as number);
      const total = values.reduce((s, v) => s + v, 0);
      return {
        avg: total / values.length,
        total,
        last: values[values.length - 1] || 0,
        max: Math.max(...values),
      };
    };

    return {
      inscriptions: calc('inscriptions'),
      formations: calc('formations'),
      y2c: calc('y2c'),
    };
  }, [filteredChartData]);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <Skeleton className="h-[380px] w-full rounded-2xl" />
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
      {/* ═══════════════ GRAPHIQUES ═══════════════ */}
      <Tabs defaultValue="formations" className="w-full">
        {/* ─── En-tête des tabs ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-xl border border-border/50 bg-muted/50 p-1">
            <TabsTrigger
              value="formations"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Formations
            </TabsTrigger>
            <TabsTrigger
              value="inscriptions"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Inscriptions
            </TabsTrigger>
            <TabsTrigger
              value="y2c"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <UsersRound className="h-3.5 w-3.5" />
              Communauté Y2C
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/40 p-1">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  period === p
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                )}
                aria-pressed={period === p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {!hasChartData ? (
          <EmptyState
            title="Aucune donnée de graphique disponible"
            subtitle="Les données seront affichées ici une fois disponibles"
          />
        ) : (
          <>
            {/* ═══════════════════════════════════════════ */}
            {/* FORMATIONS — Graphique premium              */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="formations" className="mt-4">
              <ChartCard
                title="Formations par mois"
                subtitle="Nombre de formations créées sur la période"
                icon={<GraduationCap className="h-4 w-4" />}
                metrics={[
                  {
                    label: 'Total',
                    value: statsCalc.formations.total,
                  },
                  {
                    label: 'Moyenne',
                    value: statsCalc.formations.avg.toFixed(1),
                  },
                  {
                    label: 'Dernier',
                    value: statsCalc.formations.last,
                    highlight: true,
                  },
                ]}
                accent="secondary"
                footer={
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="h-3 w-3 text-secondary" />
                    <span>
                      Pic à{' '}
                      <span className="font-semibold text-foreground">
                        {statsCalc.formations.max}
                      </span>{' '}
                      formations sur un mois
                    </span>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      {/* Gradient principal */}
                      <linearGradient
                        id="gradFormations"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F13544"
                          stopOpacity={1}
                        />
                        <stop
                          offset="50%"
                          stopColor="#F13544"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#F13544"
                          stopOpacity={0.5}
                        />
                      </linearGradient>
                      {/* Gradient pour la barre max */}
                      <linearGradient
                        id="gradFormationsHighlight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#010B40"
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1a2b5c"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        fill: '#F13544',
                        fillOpacity: 0.06,
                        radius: 8,
                      }}
                    />

                    {/* Ligne moyenne */}
                    <ReferenceLine
                      y={statsCalc.formations.avg}
                      stroke="#010B40"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      strokeWidth={1.5}
                      label={{
                        value: `Moy: ${statsCalc.formations.avg.toFixed(1)}`,
                        position: 'insideTopRight',
                        fontSize: 10,
                        fill: '#010B40',
                        fontWeight: 600,
                      }}
                    />

                    <Bar
                      dataKey="formations"
                      name="Formations"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                    >
                      {filteredChartData.map((entry, index) => {
                        const isMax =
                          entry.formations === statsCalc.formations.max;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              isMax
                                ? 'url(#gradFormationsHighlight)'
                                : 'url(#gradFormations)'
                            }
                          />
                        );
                      })}
                      <LabelList
                        dataKey="formations"
                        position="top"
                        offset={8}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fill: 'hsl(var(--foreground))',
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ═══════════════════════════════════════════ */}
            {/* INSCRIPTIONS                                */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="inscriptions" className="mt-4">
              <ChartCard
                title="Évolution des inscriptions"
                subtitle="Nombre d'inscriptions par mois"
                icon={<TrendingUp className="h-4 w-4" />}
                metrics={[
                  { label: 'Total', value: statsCalc.inscriptions.total },
                  {
                    label: 'Moyenne',
                    value: statsCalc.inscriptions.avg.toFixed(1),
                  },
                  {
                    label: 'Dernier',
                    value: statsCalc.inscriptions.last,
                    highlight: true,
                  },
                ]}
                accent="primary"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradInscriptions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#010B40"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="#010B40"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.2,
                        strokeDasharray: '4 4',
                      }}
                    />

                    <ReferenceLine
                      y={statsCalc.inscriptions.avg}
                      stroke="#F13544"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      strokeWidth={1.5}
                    />

                    <Area
                      type="monotone"
                      dataKey="inscriptions"
                      name="Inscriptions"
                      stroke="#010B40"
                      strokeWidth={3}
                      fill="url(#gradInscriptions)"
                      activeDot={{
                        r: 7,
                        strokeWidth: 3,
                        stroke: '#fff',
                        fill: '#010B40',
                      }}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ═══════════════════════════════════════════ */}
            {/* Y2C                                         */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="y2c" className="mt-4">
              <ChartCard
                title="Évolution des membres Y2C"
                subtitle="Croissance de la communauté"
                icon={<UsersRound className="h-4 w-4" />}
                metrics={[
                  { label: 'Total', value: statsCalc.y2c.total },
                  { label: 'Moyenne', value: statsCalc.y2c.avg.toFixed(1) },
                  {
                    label: 'Dernier',
                    value: statsCalc.y2c.last,
                    highlight: true,
                  },
                ]}
                accent="primary"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.2,
                        strokeDasharray: '4 4',
                      }}
                    />

                    <ReferenceLine
                      y={statsCalc.y2c.avg}
                      stroke="#F13544"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      strokeWidth={1.5}
                    />

                    <Line
                      type="monotone"
                      dataKey="y2c"
                      name="Membres Y2C"
                      stroke="#010B40"
                      strokeWidth={3}
                      dot={{
                        fill: '#010B40',
                        r: 5,
                        strokeWidth: 3,
                        stroke: '#fff',
                      }}
                      activeDot={{
                        r: 8,
                        strokeWidth: 3,
                        stroke: '#fff',
                        fill: '#F13544',
                      }}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* ═══════════════ RÉPARTITION DES RÔLES ═══════════════ */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Répartition des rôles</h3>
              <p className="text-xs text-muted-foreground">
                Distribution des utilisateurs
              </p>
            </div>
          </div>
          {hasRoleData && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {roleData.reduce((s, d) => s + d.value, 0)} utilisateurs
            </span>
          )}
        </div>

        <div className="p-5">
          {!hasRoleData ? (
            <EmptyState
              title="Aucune donnée de répartition"
              subtitle="Les données apparaîtront ici"
              compact
            />
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                    animationDuration={800}
                  >
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-medium text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================
interface MetricDisplay {
  label: string;
  value: number | string;
  highlight?: boolean;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  metrics?: MetricDisplay[];
  accent?: 'primary' | 'secondary' | 'success';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const ACCENT_MAP = {
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    highlight: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  secondary: {
    iconBg: 'bg-secondary/10 text-secondary',
    highlight: 'text-secondary',
    badge: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  success: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    highlight: 'text-emerald-600 dark:text-emerald-400',
    badge:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  },
};

function ChartCard({
  title,
  subtitle,
  icon,
  metrics,
  accent = 'primary',
  footer,
  children,
}: ChartCardProps) {
  const styles = ACCENT_MAP[accent];

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      {/* ─── Header ─── */}
      <div className="border-b border-border/50 bg-muted/30 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                styles.iconBg
              )}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* ─── Métriques inline ─── */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              {metrics.map((metric, idx) => (
                <div key={metric.label} className="flex items-center gap-3">
                  {idx > 0 && (
                    <div
                      className="h-8 w-px bg-border/60"
                      aria-hidden="true"
                    />
                  )}
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </p>
                    <p
                      className={cn(
                        'font-bold tabular-nums',
                        metric.highlight
                          ? styles.highlight
                          : 'text-foreground'
                      )}
                    >
                      {typeof metric.value === 'number'
                        ? metric.value.toLocaleString('fr-FR')
                        : metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Zone graphique ─── */}
      <div className="h-[380px] w-full p-4">{children}</div>

      {/* ─── Footer ─── */}
      {footer && (
        <div className="border-t border-border/40 bg-muted/20 px-5 py-2.5">
          {footer}
        </div>
      )}
    </Card>
  );
}

function EmptyState({
  title,
  subtitle,
  compact,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20',
        compact ? 'h-56' : 'h-72'
      )}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
          <BarChart3 className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{subtitle}</p>
      </div>
    </div>
  );
}