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
  Download,
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
  '#1a2b5c',
  '#F13544',
  '#f55a67',
  '#0ea5e9',
  '#10b981',
  '#6b7280',
];

// ============================================================
// TOOLTIP CUSTOM
// ============================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur-md">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="capitalize text-muted-foreground">
              {entry.name} :
            </span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {Number(entry.value).toLocaleString('fr-FR')}
            </span>
          </div>
        ))}
      </div>
    </div>
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

  // ─── Stats calculées (moyennes) ───
  const inscriptionsAvg = useMemo(() => {
    if (!filteredChartData.length) return 0;
    return (
      filteredChartData.reduce((sum, d) => sum + d.inscriptions, 0) /
      filteredChartData.length
    );
  }, [filteredChartData]);

  const formationsAvg = useMemo(() => {
    if (!filteredChartData.length) return 0;
    return (
      filteredChartData.reduce((sum, d) => sum + d.formations, 0) /
      filteredChartData.length
    );
  }, [filteredChartData]);

  const y2cAvg = useMemo(() => {
    if (!filteredChartData.length) return 0;
    return (
      filteredChartData.reduce((sum, d) => sum + d.y2c, 0) /
      filteredChartData.length
    );
  }, [filteredChartData]);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[360px] w-full rounded-2xl" />
        <Skeleton className="h-[340px] w-full rounded-2xl" />
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
      <Tabs defaultValue="inscriptions" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-xl border border-border/50 bg-muted/50 p-1">
            <TabsTrigger
              value="inscriptions"
              className="rounded-lg data-[state=active]:shadow-sm"
            >
              Inscriptions
            </TabsTrigger>
            <TabsTrigger
              value="formations"
              className="rounded-lg data-[state=active]:shadow-sm"
            >
              Formations
            </TabsTrigger>
            <TabsTrigger
              value="y2c"
              className="rounded-lg data-[state=active]:shadow-sm"
            >
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
            {/* ─── INSCRIPTIONS ─── */}
            <TabsContent value="inscriptions" className="mt-4">
              <ChartCard
                title="Évolution des inscriptions"
                subtitle={`Moyenne : ${inscriptionsAvg.toFixed(1)} / mois`}
                icon={<TrendingUp className="h-4 w-4" />}
                metric="inscriptions"
                data={filteredChartData}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredChartData}
                    margin={{ top: 20, right: 15, left: -10, bottom: 0 }}
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
                          stopOpacity={0.4}
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
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.15,
                        strokeDasharray: '4 4',
                      }}
                    />
                    <ReferenceLine
                      y={inscriptionsAvg}
                      stroke="#F13544"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      label={{
                        value: 'Moyenne',
                        position: 'right',
                        fontSize: 10,
                        fill: '#F13544',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="inscriptions"
                      name="Inscriptions"
                      stroke="#010B40"
                      strokeWidth={2.5}
                      fill="url(#gradInscriptions)"
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        stroke: '#fff',
                        fill: '#010B40',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ─── FORMATIONS ─── */}
            <TabsContent value="formations" className="mt-4">
              <ChartCard
                title="Formations par mois"
                subtitle={`Moyenne : ${formationsAvg.toFixed(1)} / mois`}
                icon={<GraduationCap className="h-4 w-4" />}
                metric="formations"
                data={filteredChartData}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredChartData}
                    margin={{ top: 20, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
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
                          offset="100%"
                          stopColor="#F13544"
                          stopOpacity={0.55}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: '#F13544', fillOpacity: 0.06 }}
                    />
                    <ReferenceLine
                      y={formationsAvg}
                      stroke="#010B40"
                      strokeDasharray="4 4"
                      strokeOpacity={0.4}
                    />
                    <Bar
                      dataKey="formations"
                      name="Formations"
                      fill="url(#gradFormations)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ─── Y2C ─── */}
            <TabsContent value="y2c" className="mt-4">
              <ChartCard
                title="Évolution des membres Y2C"
                subtitle={`Moyenne : ${y2cAvg.toFixed(1)} / mois`}
                icon={<UsersRound className="h-4 w-4" />}
                metric="y2c"
                data={filteredChartData}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredChartData}
                    margin={{ top: 20, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.15,
                        strokeDasharray: '4 4',
                      }}
                    />
                    <ReferenceLine
                      y={y2cAvg}
                      stroke="#F13544"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="y2c"
                      name="Membres Y2C"
                      stroke="#010B40"
                      strokeWidth={3}
                      dot={{
                        fill: '#010B40',
                        r: 4,
                        strokeWidth: 2,
                        stroke: '#fff',
                      }}
                      activeDot={{
                        r: 7,
                        strokeWidth: 2,
                        stroke: '#fff',
                        fill: '#F13544',
                      }}
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
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" />
              Répartition des rôles
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Distribution des utilisateurs par type de compte
            </p>
          </div>
          {hasRoleData && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              {roleData.reduce((s, d) => s + d.value, 0)} utilisateurs
            </span>
          )}
        </div>

        <div className="p-5">
          {!hasRoleData ? (
            <EmptyState
              title="Aucune donnée de répartition disponible"
              subtitle="Les données seront affichées ici une fois disponibles"
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
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                  >
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
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

/**
 * Carte de graphique pro avec :
 * - Header (icône + titre + sous-titre)
 * - Stats live (total, dernier point)
 * - Zone graphique
 */
function ChartCard({
  title,
  subtitle,
  icon,
  metric,
  data,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  metric: keyof Omit<ChartData, 'month'>;
  data: ChartData[];
  children: React.ReactNode;
}) {
  // Stats live calculées
  const total = data.reduce((sum, d) => sum + (d[metric] as number), 0);
  const last = data.length ? (data[data.length - 1][metric] as number) : 0;

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-5 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </span>
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Stats rapides */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="font-semibold tabular-nums">
              {total.toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="h-8 w-px bg-border" aria-hidden="true" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Dernier
            </p>
            <p className="font-semibold tabular-nums text-primary">
              {last.toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      <div className="h-80 w-full p-4">{children}</div>
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