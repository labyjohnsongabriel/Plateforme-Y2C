'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      toast.success('Paramètres de sécurité sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-xl">Sécurité</CardTitle>
          <CardDescription>Configurez les paramètres de sécurité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Durée de session (minutes)</Label>
            <Input id="sessionTimeout" type="number" defaultValue="30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Tentatives de connexion max</Label>
            <Input id="maxLoginAttempts" type="number" defaultValue="5" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="twoFactorAuth" />
            <Label htmlFor="twoFactorAuth">Authentification à deux facteurs</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="sslRequired" defaultChecked />
            <Label htmlFor="sslRequired">SSL requis</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-xl">Sauvegarde</CardTitle>
          <CardDescription>Configurez les sauvegardes automatiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch id="autoBackup" defaultChecked />
            <Label htmlFor="autoBackup">Sauvegarde automatique</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Fréquence (heures)</Label>
            <Input id="backupFrequency" type="number" defaultValue="24" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  );
}