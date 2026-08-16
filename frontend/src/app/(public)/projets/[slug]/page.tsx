// app/(public)/projets/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectSkeleton } from '../components/ProjectSkeleton';
import { projects } from '@/lib/api';
import { Project } from '@/types';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await projects.getBySlug(slug);
        const data = response?.data?.data ?? response?.data ?? null;
        if (data) {
          setProject(data);
        } else {
          setError('Projet non trouvé');
        }
      } catch (err) {
        console.error('Erreur chargement projet:', err);
        setError('Impossible de charger les détails du projet.');
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  // Affichage du chargement
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <ProjectSkeleton />
        </div>
      </PageTransition>
    );
  }

  // Affichage de l'erreur
  if (error || !project) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Oups !</h1>
          <p className="text-muted-foreground">{error || 'Projet introuvable'}</p>
          <a
            href="/projets"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Retour aux projets
          </a>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <ProjectDetail project={project} />
      </div>
    </PageTransition>
  );
}