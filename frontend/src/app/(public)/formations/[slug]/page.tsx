'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { FormationDetail } from './components/FormationDetail';
import { RegistrationModal } from './components/RegistrationModal';
import { formations } from '@/lib/api';
import type { Formation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FormationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await formations.getBySlug(slug);
        setFormation(response.data?.data || response.data || null);
      } catch (err) {
        console.error('Erreur chargement formation:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchFormation();
  }, [slug]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container-custom py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !formation) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="container-custom py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FormationDetail formation={formation} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tarif</span>
                  <span className="text-2xl font-bold text-primary">
                    {formation.price && formation.price > 0
                      ? `${formation.price} Ar`
                      : 'Gratuit'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prochaine session</span>
                  <span className="font-medium">
                    {formation.sessions?.find((s) => new Date(s.startDate) > new Date())
                      ? new Date(
                          formation.sessions.find((s) => new Date(s.startDate) > new Date())!
                            .startDate
                        ).toLocaleDateString('fr-FR')
                      : 'À venir'}
                  </span>
                </div>
                <Button className="w-full gap-2" size="lg" onClick={() => setIsModalOpen(true)}>
                  <CalendarPlus className="h-4 w-4" />
                  S'inscrire
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Inscription gratuite et sans engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formationId={formation.id}
        formationTitle={formation.title}
        onSuccess={() => {
          setIsModalOpen(false);
          toast.success('Inscription confirmée !');
        }}
      />
    </PageTransition>
  );
}