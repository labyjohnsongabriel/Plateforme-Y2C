'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Lottie from 'lottie-react';
import successAnimation from '../../../../../public/animations/success.json';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { cn } from '../../../../lib/utils';
import { formations } from '../../../../lib/api';
import toast from 'react-hot-toast';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  motivation: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  formationId: string;
  sessionId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function RegistrationForm({
  formationId,
  sessionId,
  onSuccess,
  className,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await formations.register(formationId, {
        ...data,
        sessionId,
      });
      setIsSuccess(true);
      reset();
      toast.success('Inscription confirmée !');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-8 dark:bg-green-950/20"
      >
        <div className="w-48 h-48">
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <h3 className="font-ubuntu text-xl font-semibold text-green-700 dark:text-green-400">
          Inscription confirmée !
        </h3>
        <p className="mt-2 text-center text-muted-foreground">
          Vous recevrez un email de confirmation sous 48h.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsSuccess(false);
            reset();
          }}
        >
          S'inscrire à une autre formation
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className={cn('border-2 border-primary/10', className)}>
      <CardHeader>
        <CardTitle className="font-ubuntu">Inscription à la formation</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour vous inscrire.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              {...register('phone')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Motivation (optionnel)</Label>
            <Textarea
              id="motivation"
              {...register('motivation')}
              rows={3}
              placeholder="Dites-nous pourquoi vous souhaitez suivre cette formation..."
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            * Champs obligatoires
          </p>
          <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                En cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}