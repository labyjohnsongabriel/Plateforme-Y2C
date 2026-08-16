// src/components/home/UpcomingEvents.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useHomeData } from '@/hooks/useHomeData';
import type { Event } from '@/types/event.types';

const eventTypeColors: Record<string, string> = {
  TEAM_SETUP: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  HACKATHON: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  THREE_S: 'bg-green-500/10 text-green-500 border-green-500/20',
  CONFERENCE: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  WORKSHOP: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
};

const eventTypeLabels: Record<string, string> = {
  TEAM_SETUP: 'Team Set Up',
  HACKATHON: 'Hackathon',
  THREE_S: '3S',
  CONFERENCE: 'Conférence',
  WORKSHOP: 'Atelier',
};

export function UpcomingEvents() {
  const { events, loading, error } = useHomeData();

  if (loading) {
    return (
      <section className="py-20 bg-background" aria-labelledby="events-title">
        <div className="container-custom">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 id="events-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
                Événements <span className="text-secondary">à venir</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Chargement...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background" aria-labelledby="events-title">
        <div className="container-custom text-center">
          <h2 id="events-title" className="font-ubuntu text-3xl font-bold text-destructive">
            Oups !
          </h2>
          <p className="mt-2 text-muted-foreground">
            Impossible de charger les événements.
          </p>
        </div>
      </section>
    );
  }

  const safeEvents = Array.isArray(events) ? events : [];
  const displayEvents = safeEvents.slice(0, 3);

  if (displayEvents.length === 0) {
    return (
      <section className="py-20 bg-background" aria-labelledby="events-title">
        <div className="container-custom text-center">
          <h2 id="events-title" className="font-ubuntu text-3xl font-bold">
            Événements <span className="text-secondary">à venir</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Aucun événement prévu pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background" aria-labelledby="events-title">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <h2 id="events-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
              Événements <span className="text-secondary">à venir</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Participez à nos prochains événements
            </p>
          </div>
          <Link
            href="/communaute-y2c"
            className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <Badge className={`text-xs border ${eventTypeColors[event.eventType] || 'bg-gray-500/10'}`}>
                      {eventTypeLabels[event.eventType] || event.eventType}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                  </div>
                  <h3 className="mt-3 font-ubuntu text-lg font-semibold line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary/70" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary/70" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-secondary hover:text-white transition-colors"
                  >
                    S'inscrire
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}