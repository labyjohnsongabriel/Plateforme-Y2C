'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from '@/components/ui/avatar-upload';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileEditForm({ profile, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    },
  });

  // ─── Mise à jour des informations ──────────────────────────
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await users.updateProfile(data);
      onSuccess(); // ← rafraîchit le profil parent
      toast.success('Profil mis à jour ✅');
    } catch (error: any) {
      // Affichage du message d’erreur renvoyé par le backend
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(msg);
      console.error('Erreur updateProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload de l’avatar ──────────────────────────────────────
  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await users.uploadAvatar(formData);
      onSuccess(); // ← rafraîchit le profil pour afficher le nouvel avatar
      toast.success('Avatar mis à jour ✅');
    } catch (error: any) {
      // Affichage du message d’erreur renvoyé par le backend
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(msg);
      console.error('Erreur uploadAvatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';

  // ─── Rendu ────────────────────────────────────────────────────
  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Modifier mes informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload d’avatar */}
          <AvatarUpload
            currentAvatar={profile?.avatar}
            onUpload={handleAvatarUpload}
            isUploading={uploadingAvatar}
            name={fullName || 'Utilisateur'}
          />

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Institution</Label>
            <Input id="bio" {...register('bio')} placeholder="Courte présentation ou institution" />
          </div>
        </CardContent>

        {/* Boutons d’action */}
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading || uploadingAvatar}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading || uploadingAvatar}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}