// app/(main)/page.tsx
'use client';

import { motion } from 'framer-motion';
import { HeroSlider } from '@/components/home/HeroSlider';
import { StatsCounter } from '@/components/home/StatsCounter';
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel';
import { FeatureCards } from '@/components/home/FeatureCards';
import { LatestNews } from '@/components/home/LatestNews';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { CallToAction } from '@/components/home/CallToAction';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <main>
        {user && (
          <div className="bg-secondary/10 border-b border-secondary/20 p-4 text-center">
          {/*  <p className="text-sm font-medium text-secondary">
            Bienvenue, {user.firstName} {user.lastName} ({user.role})
            </p>*/}
          </div>
        )}
        <HeroSlider />
        <StatsCounter />
        <FeatureCards />
        <LatestNews />
        <UpcomingEvents />
        <TestimonialCarousel />
        <CallToAction />
      </main>
    </PageTransition>
  );
}