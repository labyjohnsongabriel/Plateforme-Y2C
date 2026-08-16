// src/app/(admin)/admin/formations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { FormationTable } from './components/FormationTable';
import { FormationFormModal } from './components/FormationFormModal';
import { EditFormationModal } from './components/EditFormationModal';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminFormationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // ─── Chargement des formations ──────────────────────────────
  const fetchFormations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await formations.getAll(filters);
      // Extraction robuste : on gère plusieurs structures de réponse
      const formationsData = response?.data?.data ?? response?.data ?? [];
      setData(formationsData);
    } catch (err: any) {
      console.error('❌ Erreur chargement formations:', err);
      const msg = err?.response?.data?.message || err?.message || 'Impossible de charger les formations';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ─── Chargement initial et à chaque changement de filtres ──
  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  // ─── Callbacks des actions ──────────────────────────────────

  // Création
  const handleFormationCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    fetchFormations(); // ✅ Mise à jour automatique
    toast.success('Formation créée avec succès 🎉');
  }, [fetchFormations]);

  // Édition
  const handleEdit = useCallback((formation: any) => {
    setSelectedFormation(formation);
    setIsEditModalOpen(true);
  }, []);

  const handleFormationUpdated = useCallback(() => {
    setIsEditModalOpen(false);
    fetchFormations(); // ✅ Mise à jour automatique
    toast.success('Formation mise à jour ✅');
  }, [fetchFormations]);

  // Suppression
  const handleDelete = useCallback(async (id: string) => {
    try {
      await formations.delete(id);
      toast.success('Formation supprimée');
      fetchFormations(); // ✅ Mise à jour automatique
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(msg);
      throw err;
    }
  }, [fetchFormations]);

  // Filtres
  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
  }, []);

  // ─── Rafraîchissement manuel (optionnel) ────────────────────
  const handleManualRefresh = useCallback(() => {
    fetchFormations();
    toast.success('Liste actualisée ✅');
  }, [fetchFormations]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Formations
            </h1>
            <p className="text-muted-foreground">
              Gérez les formations de l’association.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton Rafraîchir – conservation pour usage exceptionnel */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              disabled={loading}
              className="h-9 w-9"
              aria-label="Rafraîchir la liste"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvelle formation
            </Button>
          </div>
        </div>

        {/* Affichage de l’erreur globale si présente */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tableau avec gestion des filtres */}
        <FormationTable
          data={data}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onFilterChange={handleFilterChange}
        />

        {/* Modals de création et d’édition */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <FormationFormModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onSuccess={handleFormationCreated}
            />
          )}
          {isEditModalOpen && selectedFormation && (
            <EditFormationModal
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formation={selectedFormation}
              onSuccess={handleFormationUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}