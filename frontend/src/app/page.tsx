'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Heart, 
  ChevronRight,
  Calendar,
  Newspaper,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Composants
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import StatsCounter from '@/components/home/StatsCounter';
import TestimonialCarousel from '@/components/home/TestimonialCarousel';
import AnimatedSection from '@/components/shared/AnimatedSection';

// Hooks
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Statistiques (à remplacer par données API)
  const stats = {
    members: 19,
    formations: 25,
    beneficiaries: 450,
    projects: 12,
  };

  const features = [
    {
      icon: GraduationCap,
      title: 'Formations de Qualité',
      description: 'Des formations pratiques dans les domaines du web, de la data et des technologies émergentes.',
      color: 'primary',
    },
    {
      icon: Users,
      title: 'Communauté Y2C',
      description: 'Rejoignez une communauté dynamique de passionnés des NTIC à Madagascar.',
      color: 'secondary',
    },
    {
      icon: Heart,
      title: 'Inclusion Numérique',
      description: 'Engagés pour l\'accès aux technologies pour tous, en particulier les jeunes et les femmes.',
      color: 'primary',
    },
    {
      icon: Award,
      title: 'Projets Innovants',
      description: 'Des projets concrets qui font la différence dans la communauté.',
      color: 'secondary',
    },
  ];

  const latestNews = [
    {
      id: 1,
      title: 'Lancement de la formation Next.js',
      excerpt: 'Nouvelle formation pour les développeurs web à Madagascar',
      date: '2026-02-05',
      image: '/images/blog/nextjs-training.jpg',
      slug: 'formation-nextjs-2026',
    },
    {
      id: 2,
      title: 'Hackathon Y2C 2026',
      excerpt: 'Le plus grand hackathon à Fianarantsoa réunit les talents NTIC',
      date: '2026-01-20',
      image: '/images/blog/hackathon-2026.jpg',
      slug: 'hackathon-y2c-2026',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Set Up - Janvier 2026',
      description: 'Intégration des nouveaux membres de la communauté',
      date: '2026-01-15',
      location: 'Fianarantsoa',
    },
    {
      id: 2,
      title: 'Workshop React Native',
      description: 'Développement d\'applications mobiles cross-platform',
      date: '2026-02-10',
      location: 'En ligne',
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section avec Slider */}
        <HeroSlider />

        {/* Stats Section */}
        <section className="section-padding bg-primary/5 dark:bg-primary/10">
          <div className="container-custom">
            <StatsCounter stats={stats} />
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding">
          <div className="container-custom">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-ubuntu">
                  Notre <span className="text-gradient">Mission</span>
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  Promouvoir l&apos;inclusion numérique et l&apos;innovation à Madagascar
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-hover p-6 rounded-xl border bg-card/50 backdrop-blur-sm"
                  >
                    <div className={`p-3 rounded-lg w-fit bg-${feature.color}/10 mb-4`}>
                      <Icon className={`h-8 w-8 text-${feature.color}`} />
                    </div>
                    <h3 className="font-ubuntu text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest News */}
        <section className="section-padding bg-muted/30">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <AnimatedSection>
                <h2 className="text-3xl font-bold font-ubuntu">
                  Dernières <span className="text-gradient">Actualités</span>
                </h2>
              </AnimatedSection>
              <button
                onClick={() => router.push('/blog')}
                className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover rounded-xl overflow-hidden border bg-card"
                  onClick={() => router.push(`/blog/${news.slug}`)}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(news.date).toLocaleDateString('fr-FR')}
                    </p>
                    <h3 className="font-ubuntu font-semibold mb-2 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {news.excerpt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Events */}
        <section className="section-padding">
          <div className="container-custom">
            <AnimatedSection>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold font-ubuntu">
                  Événements à <span className="text-gradient">Venir</span>
                </h2>
                <button
                  onClick={() => router.push('/evenements')}
                  className="text-sm font-medium text-primary hover:text-secondary transition-colors flex items-center gap-1"
                >
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0 }}                 transition={{ delay: index * 0.1 }}
                  className="card-hover p-6 rounded-xl border bg-card flex items-start gap-4"
                >
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-ubuntu font-semibold mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-primary/5 dark:bg-primary/10">
          <div className="container-custom">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-ubuntu">
                  Ce qu&apos;ils disent de <span className="text-gradient">Nous</span>
                </h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  Découvrez les témoignages de nos bénéficiaires et partenaires
                </p>
              </div>
            </AnimatedSection>
            <TestimonialCarousel />
          </div>
        </section>

        {/* Call to Action */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="container-custom relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold font-ubuntu mb-4">
                  Prêt à rejoindre l&apos;aventure ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Rejoignez la communauté Youth Computing et participez à la transformation numérique de Madagascar
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => router.push('/communaute-y2c')}
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Devenir membre
                  </button>
                  <button
                    onClick={() => router.push('/formations')}
                    className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                  >
                    Voir les formations
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}