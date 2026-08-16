'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Mail, Phone, User, FileText } from 'lucide-react';

export function ProfileInfo({ profile, onEdit }) {
  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '—';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={profile?.avatar} alt={fullName} />
            <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Vos données personnelles</CardDescription>
          </div>
        </div>
        <Button onClick={onEdit} variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
              <p className="font-medium">{fullName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="font-medium">{profile?.phone || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio / Institution</p>
              <p className="font-medium">{profile?.bio || 'Non renseignée'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm font-medium text-muted-foreground">Statut :</span>
          <Badge variant={profile?.isActive ? 'default' : 'secondary'}>
            {profile?.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Badge variant="outline" className="ml-2">{profile?.role || 'Admin'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}