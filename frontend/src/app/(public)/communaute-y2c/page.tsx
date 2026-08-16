'use client';

import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { CommunityPresentation } from './components/CommunityPresentation';
import { ActivitiesGrid } from './components/ActivitiesGrid';
import { BenefitsSection } from './components/BenefitsSection';
import { MembershipForm } from './components/MembershipForm';
import { EventCalendar } from './components/EventCalendar';

export default function Y2CPage() {
  return (
    <PageTransition>
      <div className="container-custom py-12 relative">
        {/* Décoration de fond */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
            Communauté <span className="text-secondary">Y2C</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez la communauté Youth Computing Community et faites partie
            d'un réseau dynamique de passionnés des NTIC à Madagascar.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="inline-block h-1.5 w-16 rounded-full bg-secondary" />
            <span className="inline-block h-1.5 w-8 rounded-full bg-primary/30" />
          </div>
        </motion.div>

        {/* Présentation avec Lottie */}
        <CommunityPresentation />

        {/* Activités */}
        <ActivitiesGrid />

        {/* Avantages */}
        <BenefitsSection />

        {/* Formulaire et calendrier */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <MembershipForm />
          <EventCalendar />
        </div>
      </div>
    </PageTransition>
  );
}