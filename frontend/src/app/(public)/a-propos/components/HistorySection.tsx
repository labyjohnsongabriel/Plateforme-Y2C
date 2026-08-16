'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Award, Heart, Clock, Zap } from 'lucide-react';

const iconMap = {
  Calendar: Calendar,
  Users: Users,
  Award: Award,
  Heart: Heart,
  Clock: Clock,
  Zap: Zap,
};

// Données statiques (évite l'appel API qui n'existe pas)
const defaultMilestones = [
  { year: '2021', title: 'Création de l\'association', description: 'Youth Computing est fondée par trois étudiants passionnés.', icon: 'Calendar' },
  { year: '2022', title: 'Première formation', description: 'Lancement des premières formations en programmation.', icon: 'Users' },
  { year: '2023', title: 'Communauté Y2C', description: 'Création de la communauté Youth Computing Community.', icon: 'Award' },
  { year: '2024', title: 'Expansion nationale', description: 'Développement des activités à travers Madagascar.', icon: 'Heart' },
];

export function HistorySection() {
  const milestones = defaultMilestones;

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
          Notre Histoire
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
      </motion.div>

      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/20" />

        <div className="space-y-12">
          {milestones.map((milestone, index) => {
            const Icon = iconMap[milestone.icon as keyof typeof iconMap] || Calendar;
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-secondary/10 p-2 text-secondary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-secondary">{milestone.year}</span>
                        <h3 className="font-ubuntu text-lg font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white shadow-lg">
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>

                <div className="flex-1" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}