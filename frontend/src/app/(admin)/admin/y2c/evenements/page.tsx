'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/shared/PageTransition';
import { EventsTable } from './components/EventsTable';
import { EventFormModal } from './components/EventFormModal';
import { y2c } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminY2CEventsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement des événements ──────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await y2c.getEvents();
      // ✅ Correction : le tableau est dans response.data.data.data
      const eventsData = response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
      setEvents(eventsData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      if (error.response?.status === 403) {
        toast.error('Accès interdit – vous devez être administrateur.');
        return;
      }
      console.error('❌ Erreur chargement événements :', error);
      toast.error('Impossible de charger les événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
  }, [authLoading, fetchEvents]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    fetchEvents();
    toast.success(editingEvent ? 'Événement modifié ✅' : 'Événement créé 🎉');
  };

  const handleDelete = async (event) => {
    try {
      await y2c.deleteEvent(event.id);
      toast.success('Événement supprimé');
      await fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  // ─── États de chargement / auth ──────────────────────────
  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Événements Y2C
            </h1>
            <p className="text-muted-foreground">
              Gérez les événements de la communauté Youth Computing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvel événement
            </Button>
          </div>
        </div>

        <EventsTable
          data={events}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </div>

      <EventFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        event={editingEvent}
        onSuccess={handleSuccess}
      />
    </PageTransition>
  );
}