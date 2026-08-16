// app/(admin)/admin/dashboard/page.tsx

'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { NotificationsPanel } from './components/NotificationsPanel';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RefreshCw, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats();

  return (
    <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']} showError>
      <PageTransition>
        <div className="space-y-6">
          {/* ─── EN-TÊTE ─── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-secondary">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-ubuntu text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Tableau de bord
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Bienvenue, <span className="font-medium text-foreground">{user?.firstName || 'Utilisateur'}</span> 👋 Voici un aperçu de votre activité.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Actualiser</span>
              <span className="sm:hidden">Actu.</span>
            </Button>
          </motion.div>

          {/* ─── ERREUR ─── */}
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
          )}

          {/* ─── STATISTIQUES ─── */}
          <section aria-label="Statistiques">
            <StatsOverview stats={stats?.stats} loading={loading} />
          </section>

          {/* ─── ACTIONS RAPIDES ─── 
          <section aria-label="Actions rapides">
            <QuickActions />
          </section>
*/}
          {/* ─── GRILLE PRINCIPALE ─── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Graphiques – 2/3 de la largeur */}
            <div className="lg:col-span-2">
              <ChartsSection stats={stats?.stats} loading={loading} />
            </div>

            {/* Colonne de droite – 1/3 */}
            <div className="space-y-6 lg:col-span-1">
              <NotificationsPanel
                notifications={stats?.notifications}
                loading={loading}
              />
              <RecentActivity
                activities={stats?.activities}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}