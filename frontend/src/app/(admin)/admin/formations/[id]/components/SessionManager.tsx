'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';

interface SessionManagerProps {
  formationId: string;
  sessions: any[];
}

export function SessionManager({ formationId, sessions: initialSessions }: SessionManagerProps) {
  const [sessions, setSessions] = useState(initialSessions || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState({
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
  });

  const handleAddSession = async () => {
    try {
      // Appel API pour créer la session
      toast.success('Session ajoutée avec succès');
      setIsAdding(false);
      setNewSession({ startDate: '', endDate: '', location: '', maxParticipants: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    try {
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success('Session supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-ubuntu text-lg font-semibold">Sessions</h3>
        <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une session
        </Button>
      </div>

      {sessions.length === 0 && !isAdding && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucune session pour le moment
          </CardContent>
        </Card>
      )}

      {isAdding && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="datetime-local"
                  value={newSession.startDate}
                  onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="datetime-local"
                  value={newSession.endDate}
                  onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Lieu</Label>
                <Input
                  placeholder="Lieu"
                  value={newSession.location}
                  onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Participants max</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({ ...newSession, maxParticipants: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleAddSession}>
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">
                {formatDate(session.startDate)} - {formatDate(session.endDate)}
              </p>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <span>{session.location}</span>
                <span>•</span>
                <span>{session.currentParticipants || 0}/{session.maxParticipants || '∞'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={session.status === 'SCHEDULED' ? 'success' : 'secondary'}>
                {session.status || 'SCHEDULED'}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteSession(session.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}