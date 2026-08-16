'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { y2c } from '@/lib/api';
import toast from 'react-hot-toast';

const membershipSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  institution: z.string().optional(),
  motivation: z.string().optional(),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

export function MembershipForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
  });

  const onSubmit = async (data: MembershipFormData) => {
    setIsLoading(true);
    try {
      await y2c.createMember({
        ...data,
        membershipFeePaid: 25000,
      });
      setIsSuccess(true);
      reset();
      toast.success('Adhésion enregistrée avec succès ! 🎉');
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erreur lors de l'adhésion";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="rounded-full bg-green-500/20 p-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </motion.div>
          <h3 className="font-ubuntu text-2xl font-bold text-foreground">
            Adhésion réussie !
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Vous recevrez un email de confirmation sous 48h. Bienvenue dans la communauté Y2C !
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="mt-2"
          >
            S'inscrire un autre membre
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-secondary/5 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="font-ubuntu text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-secondary" />
          Devenir membre Y2C
        </CardTitle>
        <CardDescription>
          Rejoignez la communauté pour seulement <span className="font-semibold text-secondary">25 000 Ar</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground/80">
              <span className="text-secondary">•</span>
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <div className={`relative transition-all duration-300 rounded-xl border-2 ${errors.name ? 'border-destructive' : 'border-input/50 focus-within:border-secondary'}`}>
              <Input
                id="name"
                {...register('name')}
                className="h-12 pl-4 border-0 bg-transparent focus-visible:ring-0"
                disabled={isLoading}
                placeholder="Votre nom et prénom"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground/80">
              <span className="text-secondary">•</span>
              Email <span className="text-destructive">*</span>
            </Label>
            <div className={`relative transition-all duration-300 rounded-xl border-2 ${errors.email ? 'border-destructive' : 'border-input/50 focus-within:border-secondary'}`}>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="h-12 pl-4 border-0 bg-transparent focus-visible:ring-0"
                disabled={isLoading}
                placeholder="vous@exemple.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground/80">
              <span className="text-secondary">•</span>
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <div className={`relative transition-all duration-300 rounded-xl border-2 ${errors.phone ? 'border-destructive' : 'border-input/50 focus-within:border-secondary'}`}>
              <Input
                id="phone"
                {...register('phone')}
                className="h-12 pl-4 border-0 bg-transparent focus-visible:ring-0"
                disabled={isLoading}
                placeholder="+261 34 12 34 567"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="institution" className="flex items-center gap-2 text-foreground/80">
              <span className="text-secondary">•</span>
              Institution (optionnel)
            </Label>
            <Input
              id="institution"
              {...register('institution')}
              className="h-12 border-input/50 bg-transparent focus-visible:ring-secondary"
              disabled={isLoading}
              placeholder="Université, école, entreprise..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivation" className="flex items-center gap-2 text-foreground/80">
              <span className="text-secondary">•</span>
              Motivation (optionnel)
            </Label>
            <Textarea
              id="motivation"
              {...register('motivation')}
              rows={3}
              className="border-input/50 bg-transparent focus-visible:ring-secondary resize-none"
              placeholder="Pourquoi voulez-vous rejoindre la communauté Y2C ?"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="relative w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 overflow-hidden group"
            disabled={isLoading || isSubmitting}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  En cours...
                </>
              ) : (
                <>
                  Adhérer (25 000 Ar)
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}