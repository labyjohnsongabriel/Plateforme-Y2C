'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: number;               // en pourcentage, positif = hausse
  trendLabel?: string;          // libellé personnalisé (ex: "+15% ce mois")
  loading?: boolean;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  delay?: number;
  // Options de formatage
  format?: 'number' | 'currency' | 'compact' | 'percent';
  currency?: string;            // ex: 'Ar', '€', '$'
  suffix?: string;
  prefix?: string;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
  danger: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
  info: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400',
};

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
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayCount, setDisplayCount] = useState<number | string | null>(null);

  const isNumeric = typeof value === 'number';

  // Formateur de valeur
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') {
      // Si déjà une chaîne, on l'utilise telle quelle (avec préfixe/suffixe personnalisés)
      return val;
    }

    let formatted = '';
    switch (format) {
      case 'currency':
        formatted = val.toLocaleString('fr-FR', { style: 'currency', currency: currency || 'EUR' });
        break;
      case 'compact':
        if (val >= 1_000_000) {
          formatted = (val / 1_000_000).toFixed(1) + 'M';
        } else if (val >= 1_000) {
          formatted = (val / 1_000).toFixed(1) + 'k';
        } else {
          formatted = val.toLocaleString();
        }
        break;
      case 'percent':
        formatted = val.toFixed(1) + '%';
        break;
      default:
        formatted = val.toLocaleString();
    }

    // Ajout du préfixe/suffixe personnalisé
    if (prefix) formatted = prefix + formatted;
    if (suffix) formatted += suffix;

    return formatted;
  };

  // Animation du compteur (uniquement si valeur numérique)
  useEffect(() => {
    if (!isInView || loading || !isNumeric) return;
    const numValue = value as number;
    const duration = 800; // plus rapide
    const steps = 50;
    const increment = numValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayCount(numValue);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value, loading, isNumeric]);

  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-3 w-40" />
      </div>
    );
  }

  // Valeur finale affichée
  const finalDisplay = displayCount !== null && isNumeric
    ? formatValue(displayCount)
    : formatValue(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Dégradé d'arrière-plan au survol (effet subtil) */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
          color === 'primary' && 'bg-primary/5',
          color === 'secondary' && 'bg-secondary/5',
          color === 'success' && 'bg-emerald-500/5',
          color === 'warning' && 'bg-amber-500/5',
          color === 'danger' && 'bg-red-500/5',
          color === 'info' && 'bg-cyan-500/5'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold font-ubuntu tabular-nums tracking-tight">
            {finalDisplay}
          </p>
        </div>
        <div className={cn('rounded-lg border p-2.5', colorClasses[color])}>
          {icon}
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2 text-xs">
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full',
              trendPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              trendNegative && 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            {trendPositive && <ArrowUp className="h-3 w-3" />}
            {trendNegative && <ArrowDown className="h-3 w-3" />}
            {trend !== 0 ? `${Math.abs(trend)}%` : '0%'}
          </span>
        )}
        <span className="text-muted-foreground">
          {description || trendLabel}
        </span>
      </div>
    </motion.div>
  );
}