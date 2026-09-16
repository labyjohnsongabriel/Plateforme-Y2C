// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import { useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { QuickStats } from './components/QuickStats';
// import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';
import { NotificationsPanel } from './components/NotificationsPanel';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  RefreshCw,
  LayoutDashboard,
  Zap,
  BarChart3,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats();

  // ─── Fetcher REST pour les notifications (fallback si socket KO) ───
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }, []);

  return (
    <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']} showError>
      <PageTransition>
        <div className="space-y-6">
          {/* ═══════════════ EN-TÊTE ═══════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary shadow-sm sm:flex">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-ubuntu text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Tableau de bord
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Bienvenue,{' '}
                  <span className="font-medium text-foreground">
                    {user?.firstName || 'Utilisateur'}
                  </span>{' '}
                  👋 Voici un aperçu de votre activité.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="gap-2 border-primary/20 bg-primary/5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Actualiser</span>
              <span className="sm:hidden">Actu.</span>
            </Button>
          </motion.div>

          {/* ═══════════════ ERREUR ═══════════════ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-xl border border-red-200/50 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
              <div className="relative flex items-start gap-3">
                <span className="mt-0.5 text-red-500">⚠️</span>
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )} {/* ✅ Parenthèse fermante corrigée */}

          {/* ═══════════════ 1. QUICK STATS (temps réel) ═══════════════ */}
          {stats?.quickStats && Object.keys(stats.quickStats).length > 0 && (
            <section aria-label="Statistiques rapides" className="space-y-3">
              <header className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  En direct
                </h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Temps réel
                </span>
              </header>
              <QuickStats data={stats.quickStats} />
            </section>
          )}

          {/* ═══════════════ 2. STATS GÉNÉRALES (vue d'ensemble) ═══════════════ */}
          <section aria-label="Statistiques générales" className="space-y-3">
            <header className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Vue d'ensemble
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                Données cumulées
              </span>
            </header>
            <StatsOverview stats={stats?.stats} loading={loading} />
          </section>

          {/* ═══════════════ 3. ACTIONS RAPIDES (optionnel) ═══════════════ */}
          {/*
          <section aria-label="Actions rapides">
            <QuickActions />
          </section>
          */}

          {/* ═══════════════ 4. GRAPHIQUES + ACTIVITÉS ═══════════════ */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Graphiques – 2/3 de la largeur */}
            <div className="lg:col-span-2">
              <ChartsSection
                stats={{
                  chartData: stats?.chartData,
                  roleData: stats?.roleData,
                  // ⚠️ summary RETIRÉ pour éviter les doublons de cartes
                  //    (StatsOverview gère déjà les 8 cartes)
                }}
                loading={loading}
              />
            </div>

            {/* Colonne droite – 1/3 de la largeur */}
            <div className="space-y-6 lg:col-span-1">
              <section aria-label="Notifications" className="space-y-3">
                <header className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <ListChecks className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Activité
                  </h2>
                </header>

                {/* ⚡ Notifications temps réel (socket + fallback REST) */}
                <NotificationsPanel fetcher={fetchNotifications} />

                {/* 📋 Activités récentes (limitées à 5) */}
                <RecentActivities
                  activities={stats?.activities || []}
                  loading={loading}
                  limit={5}
                />
              </section>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}