'use client';

import { motion } from 'framer-motion';
import { FormationCard } from './FormationCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Formation } from '@/types';

interface FormationGridProps {
  formations: Formation[];
  loading?: boolean;
}

export function FormationGrid({ formations, loading = false }: FormationGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (formations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/30 p-4 mb-4">
          <span className="text-4xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Aucune formation trouvée</h3>
        <p className="mt-2 text-muted-foreground">
          Aucune formation ne correspond à vos critères. Essayez de modifier votre recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {formations.map((formation, index) => (
        <FormationCard key={formation.id} formation={formation} index={index} />
      ))}
    </div>
  );
}