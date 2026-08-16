'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Loader2 } from 'lucide-react';
import { ProfileInfo } from './components/ProfileInfo';
import { ProfileEditForm } from './components/ProfileEditForm';
import { PasswordChangeForm } from './components/PasswordChangeForm';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await users.getProfile();
      setProfile(response.data.data || response.data);
    } catch (error) {
      toast.error('Impossible de charger votre profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateSuccess = () => {
    setEditing(false);
    fetchProfile(); // ← rafraîchit automatiquement
    toast.success('Profil mis à jour ✅');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Utilisateur';

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et votre mot de passe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar avec avatar */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-2 border-primary/20 mb-2">
                <AvatarImage src={profile?.avatar} alt={fullName} />
                <AvatarFallback className="text-2xl">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{fullName}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-center">
              <p><span className="font-medium">Rôle :</span> {profile?.role || 'Admin'}</p>
              <p><span className="font-medium">Inscrit depuis :</span> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Informations
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Sécurité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                {editing ? (
                  <ProfileEditForm
                    profile={profile}
                    onSuccess={handleUpdateSuccess}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <ProfileInfo
                    profile={profile}
                    onEdit={() => setEditing(true)}
                  />
                )}
              </TabsContent>

              <TabsContent value="security" className="mt-4">
                <PasswordChangeForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}