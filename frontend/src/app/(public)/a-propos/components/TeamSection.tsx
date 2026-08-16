'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { team } from '@/lib/api';
import { getInitials } from '@/lib/utils';

interface TeamMember {
  id: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  role?: string;
  department?: string;
  bio?: string;
  linkedin?: string;
  photoUrl?: string;
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await team.getActive();
        const data = response.data?.data || response.data || [];
        // Sécurisation des données
        const safeData = data.map((member: any) => ({
          ...member,
          user: member.user || { firstName: 'Utilisateur', lastName: '', email: '' },
        }));
        setMembers(safeData);
      } catch (err) {
        console.error('Erreur équipe:', err);
        setError('Impossible de charger l’équipe.');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <p className="text-center text-muted-foreground">{error}</p>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Aucun membre de l’équipe pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
          Notre Équipe
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
        <p className="mt-4 text-muted-foreground">
          Des passionnés engagés pour la promotion des NTIC
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => {
          const user = member.user || { firstName: 'Utilisateur', lastName: '', email: '' };
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Membre';
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full text-center transition-all duration-300 hover:shadow-xl">
                <CardContent className="pt-6">
                  <Avatar className="mx-auto h-24 w-24 ring-2 ring-secondary/20">
                    <AvatarImage src={member.photoUrl || user.avatar} />
                    <AvatarFallback className="text-2xl bg-secondary/10 text-secondary">
                      {getInitials(user.firstName || '', user.lastName || '') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-ubuntu font-semibold">{fullName}</h3>
                  <p className="text-sm font-medium text-primary">{member.role || 'Membre'}</p>
                  <p className="text-xs text-muted-foreground">{member.department || ''}</p>
                  {member.bio && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
                  )}
                  <div className="mt-4 flex justify-center gap-2">
                    {user.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                        onClick={() => window.location.href = `mailto:${user.email}`}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {member.linkedin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                        onClick={() => window.open(member.linkedin, '_blank')}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}