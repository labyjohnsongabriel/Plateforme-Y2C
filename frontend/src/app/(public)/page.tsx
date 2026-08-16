import { Suspense } from 'react';
import { HeroSlider } from '../../components/home/HeroSlider';
import { StatsCounter } from '../../components/home/StatsCounter';
import { FeatureCards } from '../../components/home/FeatureCards';
import { LatestNews } from '../../components/home/LatestNews';
import { UpcomingEvents } from '../../components/home/UpcomingEvents';
import { TestimonialCarousel } from '../../components/home/TestimonialCarousel';
import { CallToAction } from '../../components/home/CallToAction';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<LoadingSpinner fullScreen label="Chargement..." />}>
        <HeroSlider />
      </Suspense>
      <StatsCounter />
      <FeatureCards />
      <Suspense fallback={<LoadingSpinner />}>
        <LatestNews />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <UpcomingEvents />
      </Suspense>
      <TestimonialCarousel />
      <CallToAction />
    </main>
  );
}