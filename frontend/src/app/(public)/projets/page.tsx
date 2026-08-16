// app/(public)/projets/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectFilters } from './components/ProjectFilters';
import { FeaturedProjects } from './components/FeaturedProjects';
import { projects } from '@/lib/api';
import { Project } from '@/types';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Récupération des projets avec filtres
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projects.getAll(filters);
      const data = response?.data?.data ?? response?.data ?? [];
      setProjectsData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement projets:', err);
      setError('Impossible de charger les projets. Veuillez réessayer plus tard.');
      toast.error('Erreur de chargement des projets');
      setProjectsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Projets en vedette
  const featuredProjects = useMemo(
    () => projectsData.filter((p) => p.isFeatured),
    [projectsData]
  );

  // Gestion du changement de filtre
  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
  }, []);

  // Rendu du contenu
  const renderContent = () => {
    if (isLoading) {
      return <ProjectGrid loading count={6} />;
    }

    if (error) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-destructive/20 p-12 text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (projectsData.length === 0) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">Aucun projet trouvé</p>
          <p className="text-sm text-muted-foreground/60">Essayez de modifier vos filtres.</p>
        </div>
      );
    }

    return <ProjectGrid projects={projectsData} />;
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Nos <span className="text-secondary">Projets</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les projets réalisés par Youth Computing, porteurs d&apos;innovation et d&apos;impact.
          </p>
        </motion.div>

        {/* Projets en vedette */}
        {!isLoading && featuredProjects.length > 0 && (
          <FeaturedProjects projects={featuredProjects} />
        )}

        {/* Filtres et grille */}
        <div className="mt-12">
          <ProjectFilters onFilterChange={handleFilterChange} isLoading={isLoading} />
          <div className="mt-6">{renderContent()}</div>
        </div>
      </div>
    </PageTransition>
  );
}