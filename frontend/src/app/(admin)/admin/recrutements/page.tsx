// app/(admin)/admin/recrutements/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { RecruitmentsTable } from './components/RecruitmentsTable';
import { RecruitmentFormModal } from './components/RecruitmentFormModal';
import { recruitments } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminRecruitmentsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ─── Chargement des recrutements ──────────────────────
  const fetchRecruitments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recruitments.getAll();
      const data = response?.data?.data || response?.data || [];
      setData(data);
    } catch (error) {
      console.error('Erreur chargement recrutements:', error);
      toast.error('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // ─── Callback après création ────────────────────────
  const handleRecruitmentCreated = useCallback(() => {
    setIsModalOpen(false);
    fetchRecruitments();
    toast.success('Offre créée avec succès 🎉');
  }, [fetchRecruitments]);

  // ─── Callback après suppression ─────────────────────
  const handleDelete = useCallback(async (recruitment: any) => {
    try {
      await recruitments.delete(recruitment.id);
      toast.success('Offre supprimée');
      fetchRecruitments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  }, [fetchRecruitments]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Recrutements
            </h1>
            <p className="text-muted-foreground">
              Gérez les offres d’emploi et de stage de l’association.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchRecruitments}
              disabled={loading}
              className="h-9 w-9"
              aria-label="Rafraîchir"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvelle offre
            </Button>
          </div>
        </div>

        {/* ─── Tableau ──────────────────────────────────── */}
        <RecruitmentsTable
          data={data}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* ─── Modal du formulaire ─────────────────────── */}
        <AnimatePresence>
          {isModalOpen && (
            <RecruitmentFormModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSuccess={handleRecruitmentCreated}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}