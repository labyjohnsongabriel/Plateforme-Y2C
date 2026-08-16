'use client';

import { motion } from 'framer-motion';
import { Clock, Users, MapPin, Award, Target, BookOpen, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Formation } from '@/types';

interface FormationDetailProps {
  formation: Formation;
}

export function FormationDetail({ formation }: FormationDetailProps) {
  const nextSession = formation.sessions?.find((s) => new Date(s.startDate) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <Badge variant="secondary" className="mb-2">
          {formation.category}
        </Badge>
        <h1 className="font-ubuntu text-3xl font-bold">{formation.title}</h1>
        <p className="mt-2 text-muted-foreground">{formation.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Clock className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Durée</p>
            <p className="font-medium">{formation.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Award className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Niveau</p>
            <p className="font-medium">{formation.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Users className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="font-medium">{formation.maxParticipants || 'Illimité'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Calendar className="h-5 w-5 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Prochaine session</p>
            <p className="font-medium">
              {nextSession ? formatDate(nextSession.startDate) : 'À venir'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-6">
        <p className="text-sm text-muted-foreground">Tarif</p>
        <p className="text-2xl font-bold text-primary">
          {formation.price && formation.price > 0 ? formatCurrency(formation.price) : 'Gratuit'}
        </p>
      </div>

      {formation.objectives && (
        <div>
          <h3 className="font-ubuntu text-xl font-semibold">Objectifs</h3>
          <p className="mt-2 text-muted-foreground">{formation.objectives}</p>
        </div>
      )}

      {formation.prerequisites && (
        <div>
          <h3 className="font-ubuntu text-xl font-semibold">Prérequis</h3>
          <p className="mt-2 text-muted-foreground">{formation.prerequisites}</p>
        </div>
      )}
    </motion.div>
  );
}