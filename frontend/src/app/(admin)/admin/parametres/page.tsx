'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from './components/GeneralSettings';
import { SecuritySettings } from './components/SecuritySettings';

export default function AdminSettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-foreground">
            Paramètres
          </h1>
          <p className="text-muted-foreground">Configurez les paramètres de la plateforme</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <SecuritySettings />
          </TabsContent>
          <TabsContent value="email" className="mt-6">
            <p className="text-muted-foreground">Configuration des emails</p>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}