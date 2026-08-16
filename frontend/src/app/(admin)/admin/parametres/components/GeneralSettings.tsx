'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

export function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Appel API pour sauvegarder les paramètres
      toast.success('Paramètres sauvegardés');
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
          <CardTitle className="font-ubuntu text-xl">Informations générales</CardTitle>
          <CardDescription>Configurez les informations principales du site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du site</Label>
            <Input id="siteName" defaultValue="Youth Computing" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Description</Label>
            <Textarea id="siteDescription" defaultValue="Association pour la promotion des NTIC" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de contact</Label>
            <Input id="contactEmail" type="email" defaultValue="contact@youthcomputing.mg" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="maintenanceMode" />
            <Label htmlFor="maintenanceMode">Mode maintenance</Label>
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