'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { FormationGrid } from './components/FormationGrid';
import { FormationListView } from './components/FormationListView';
import { FormationFilters } from './components/FormationFilters';
import { FormationSearch } from './components/FormationSearch';
import { ViewToggle } from './components/ViewToggle';
import { formations } from '@/lib/api';
import type { Formation } from '@/types';
import { toast } from 'react-hot-toast';

export default function FormationsPage() {
  const [formationsData, setFormationsData] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchFormations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, search: searchQuery };
      const response = await formations.getAll(params);
      const data = response?.data?.data || response?.data || [];
      setFormationsData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement formations:', error);
      toast.error('Impossible de charger les formations');
      setFormationsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <PageTransition>
      <div className="container-custom py-12">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Nos <span className="text-secondary">Formations</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos programmes de formation en NTIC, conçus pour vous accompagner dans votre développement professionnel.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="inline-block h-1.5 w-16 rounded-full bg-secondary" />
            <span className="inline-block h-1.5 w-8 rounded-full bg-primary/30" />
          </div>
        </motion.div>

        {/* Recherche, filtres et bascule de vue */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <FormationSearch onSearch={handleSearch} initialValue={searchQuery} />
            </div>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
          <FormationFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Affichage selon la vue */}
        {viewMode === 'grid' ? (
          <FormationGrid formations={formationsData} loading={isLoading} />
        ) : (
          <FormationListView formations={formationsData} loading={isLoading} />
        )}
      </div>
    </PageTransition>
  );
}