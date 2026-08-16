'use client';

import { useState, useEffect, useRef } from 'react'; // ✅ ajout de useState et useEffect
import { motion, useInView } from 'framer-motion';
import { Users, GraduationCap, Building2, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeStats } from '@/hooks/useHomeData';

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2500;
      const steps = 80;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

export function StatsCounter() {
  const { data: stats, isLoading, error } = useHomeStats();

  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-primary/5 py-16 dark:bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                <Skeleton className="mx-auto mt-2 h-8 w-20" />
                <Skeleton className="mx-auto mt-1 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="relative overflow-hidden bg-primary/5 py-16 dark:bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Impossible de charger les statistiques.</p>
        </div>
      </section>
    );
  }

  const statItems = [
    { value: stats.totalY2CMembers || 0, label: 'Membres actifs', icon: Users, suffix: '' },
    { value: stats.totalFormations || 0, label: 'Formations réalisées', icon: GraduationCap, suffix: '+' },
    { value: stats.totalRegistrations || 0, label: 'Bénéficiaires', icon: Globe, suffix: '+' },
    { value: stats.totalProjects || 0, label: 'Projets communautaires', icon: Building2, suffix: '' },
  ];

  return (
    <section className="relative overflow-hidden bg-primary/5 py-16 dark:bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-primary dark:text-white md:text-4xl lg:text-5xl">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}