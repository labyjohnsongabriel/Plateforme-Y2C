// src/app/(admin)/admin/dashboard/components/StatCard.tsx
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export type StatColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BreakdownItem {
  label: string;
  value: number | string;
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
  color?: StatColor;
  delay?: number;
  format?: 'number' | 'currency' | 'compact' | 'percent';
  currency?: string;
  suffix?: string;
  prefix?: string;
  /** Mini-graphique (ex: [10, 25, 18, 32, 28, 40]) */
  sparkline?: number[];
  /** Objectif / capacité (0-100) */
  progress?: number;
  /** Badge "Nouveau" */
  isNew?: boolean;
  /** Sous-valeurs */
  breakdown?: BreakdownItem[];
}

// ============================================================
// PALETTE
// ============================================================
const COLOR_SCHEMES: Record<
  StatColor,
  {
    iconBg: string;
    glow: string;
    spark: string;
    sparkGradient: [string, string];
    progress: string;
    accent: string;
  }
> = {
  primary: {
    iconBg: 'bg-primary/10 text-primary dark:bg-primary/20',
    glow: 'from-primary/10 via-primary/5 to-transparent',
    spark: '#010B40',
    sparkGradient: ['#010B40', '#1a2b5c'],
    progress: 'bg-primary',
    accent: 'text-primary',
  },
  secondary: {
    iconBg: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
    glow: 'from-secondary/10 via-secondary/5 to-transparent',
    spark: '#F13544',
    sparkGradient: ['#F13544', '#f55a67'],
    progress: 'bg-secondary',
    accent: 'text-secondary',
  },
  success: {
    iconBg:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    glow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    spark: '#10b981',
    sparkGradient: ['#10b981', '#34d399'],
    progress: 'bg-emerald-500',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    iconBg:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    spark: '#f59e0b',
    sparkGradient: ['#f59e0b', '#fbbf24'],
    progress: 'bg-amber-500',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    iconBg:
      'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    glow: 'from-red-500/10 via-red-500/5 to-transparent',
    spark: '#ef4444',
    sparkGradient: ['#ef4444', '#f87171'],
    progress: 'bg-red-500',
    accent: 'text-red-600 dark:text-red-400',
  },
  info: {
    iconBg:
      'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
    glow: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    spark: '#06b6d4',
    sparkGradient: ['#06b6d4', '#22d3ee'],
    progress: 'bg-cyan-500',
    accent: 'text-cyan-600 dark:text-cyan-400',
  },
};

// ============================================================
// SPARKLINE — ID unique par instance
// ============================================================
function Sparkline({
  data,
  color,
  gradient,
  gradientId,
}: {
  data: number[];
  color: string;
  gradient: [string, string];
  gradientId: string;
}) {
  if (!data || data.length < 2) return null;

  const width = 100;
  const height = 32;
  const padding = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - padding - ((v - min) / range) * (height - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.35} />
          <stop offset="100%" stopColor={gradient[1]} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ============================================================
// HOOK — Compteur animé (requestAnimationFrame)
// ============================================================
function useAnimatedCount(
  target: number | string,
  enabled: boolean
): number | string | null {
  const [display, setDisplay] = useState<number | string | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Non numérique → affichage direct
    if (typeof target !== 'number') {
      setDisplay(target);
      return;
    }

    // Motion réduite ou pas d'animation → valeur finale directe
    if (!enabled || prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const from = 0;
    const to = target;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing outExpo (animation fluide)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled, prefersReducedMotion]);

  return display;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendLabel = 'vs mois dernier',
  loading = false,
  className,
  color = 'primary',
  delay = 0,
  format = 'number',
  currency = '',
  suffix = '',
  prefix = '',
  sparkline,
  progress,
  isNew = false,
  breakdown,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const gradientId = useId().replace(/:/g, '-'); // ID SVG unique
  const scheme = COLOR_SCHEMES[color];

  const isNumeric = typeof value === 'number';
  const animatedCount = useAnimatedCount(value, isInView && !loading);

  // ─── Formatage mémoïsé ───
  const formatValue = useMemo(
    () =>
      (val: number | string): string => {
        if (typeof val === 'string') return val;

        let formatted = '';
        switch (format) {
          case 'currency': {
            const currencyCode = currency || 'EUR';
            try {
              formatted = val.toLocaleString('fr-FR', {
                style: 'currency',
                currency: currencyCode,
                maximumFractionDigits: 0,
              });
            } catch {
              formatted = val.toLocaleString('fr-FR') + ' ' + currencyCode;
            }
            break;
          }
          case 'compact':
            if (val >= 1_000_000) formatted = (val / 1_000_000).toFixed(1) + 'M';
            else if (val >= 1_000) formatted = (val / 1_000).toFixed(1) + 'k';
            else formatted = val.toLocaleString('fr-FR');
            break;
          case 'percent':
            formatted = val.toFixed(1) + '%';
            break;
          default:
            formatted = val.toLocaleString('fr-FR');
        }

        if (prefix) formatted = prefix + formatted;
        if (suffix) formatted += suffix;
        return formatted;
      },
    [format, currency, prefix, suffix]
  );

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend !== undefined && trend === 0;

  // ─── Loading ───
  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-8 w-full" />
      </div>
    );
  }

  // ─── Valeur affichée ───
  const displayValue =
    animatedCount !== null && isNumeric
      ? formatValue(animatedCount)
      : formatValue(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: delay * 0.06, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
        'transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg',
        className
      )}
    >
      {/* ─── Glow au survol ─── */}
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          scheme.glow
        )}
        aria-hidden="true"
      />

      {/* ─── Badge "Nouveau" ─── */}
      {isNew && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-secondary to-secondary/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          <Sparkles className="h-2.5 w-2.5" />
          NOUVEAU
        </div>
      )}

      <div className="relative p-5">
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p
              className="mt-1.5 text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground"
              aria-label={`${title} : ${displayValue}`}
            >
              {displayValue}
            </p>
          </div>

          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
              scheme.iconBg
            )}
          >
            {icon}
          </div>
        </div>

        {/* ─── Trend + Description ─── */}
        {(trend !== undefined || description) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold tabular-nums',
                  trendPositive &&
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  trendNegative &&
                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  trendNeutral && 'bg-muted text-muted-foreground'
                )}
              >
                {trendPositive && <ArrowUp className="h-3 w-3" />}
                {trendNegative && <ArrowDown className="h-3 w-3" />}
                {trendNeutral && <Minus className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
            <span className="truncate text-muted-foreground">
              {description || trendLabel}
            </span>
          </div>
        )}

        {/* ─── Sparkline ─── */}
        {sparkline && sparkline.length > 1 && (
          <div className="mt-3 -mx-1">
            <Sparkline
              data={sparkline}
              color={scheme.spark}
              gradient={scheme.sparkGradient}
              gradientId={`spark-${gradientId}`}
            />
          </div>
        )}

        {/* ─── Progress bar ─── */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] font-medium">
              <span className="text-muted-foreground">Progression</span>
              <span className={cn('tabular-nums', scheme.accent)}>
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.min(Math.round(progress), 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={
                  isInView
                    ? { width: `${Math.min(progress, 100)}%` }
                    : { width: 0 }
                }
                transition={{
                  duration: 1,
                  delay: delay * 0.06 + 0.3,
                  ease: 'easeOut',
                }}
                className={cn('h-full rounded-full', scheme.progress)}
              />
            </div>
          </div>
        )}

        {/* ─── Breakdown (adaptatif) ─── */}
        {breakdown && breakdown.length > 0 && (
          <div
            className={cn(
              'mt-3 grid gap-2 border-t border-border/40 pt-3',
              breakdown.length === 1 && 'grid-cols-1',
              breakdown.length === 2 && 'grid-cols-2',
              breakdown.length === 3 && 'grid-cols-3',
              breakdown.length >= 4 && 'grid-cols-2 sm:grid-cols-4'
            )}
          >
            {breakdown.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={cn(
                    'truncate text-sm font-semibold tabular-nums',
                    item.color || 'text-foreground'
                  )}
                >
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString('fr-FR')
                    : item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}