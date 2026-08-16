'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { HistorySection } from './components/HistorySection';
import { OrganigrammeSection } from './components/OrganigrammeSection';
import { TeamSection } from './components/TeamSection';
import { ValuesSection } from './components/ValuesSection';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="container max-w-6xl space-y-16 py-10">
        <div>
          <h1 className="font-ubuntu text-4xl font-bold text-foreground">À propos</h1>
          <p className="text-muted-foreground">
            Découvrez l’histoire, l’organisation et les valeurs de Youth Computing.
          </p>
        </div>

        <HistorySection />
        <OrganigrammeSection />
        <TeamSection />
        <ValuesSection />
      </div>
    </PageTransition>
  );
}