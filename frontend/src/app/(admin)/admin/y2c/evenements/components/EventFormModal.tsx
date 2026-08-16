'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CalendarPlus,
  DollarSign,
  Image,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Y2CEvent } from './EventsTable';

// ─── Types ──────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: 'TRAINING', label: 'Formation' },
  { value: 'CONFERENCE', label: 'Conférence' },
  { value: 'WORKSHOP', label: 'Atelier' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'TEAM_SETUP', label: 'Team Set Up' },
  { value: 'THREE_S', label: '3S' },
  { value: 'TEAM_REALIZE', label: 'Team Realize' },
  { value: 'COFFREDAY', label: 'Coffreday' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'OTHER', label: 'Autre' },
];

// ─── Schéma de validation ──────────────────────────────────
const eventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  eventType: z.string().min(1, 'Le type d’événement est requis'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  location: z.string().min(3, 'Le lieu doit contenir au moins 3 caractères'),
  maxParticipants: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(1, 'Le minimum est 1 participant').optional()
  ),
  isPaid: z.boolean().default(false),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Le prix ne peut pas être négatif').optional()
  ),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Y2CEvent; // si présent, on est en mode édition
  onSuccess: () => void;
}

export function EventFormModal({
  open,
  onOpenChange,
  event,
  onSuccess,
}: EventFormModalProps) {
  const isEditing = !!event;
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: undefined,
      isPaid: false,
      price: undefined,
      imageUrl: '',
      isPublished: false,
    },
  });

  // ─── Pré-remplir le formulaire en mode édition ──────────
  useEffect(() => {
    if (event) {
      // Formater les dates pour input datetime-local
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
      };

      form.reset({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        location: event.location,
        maxParticipants: event.maxParticipants || undefined,
        isPaid: event.isPaid,
        price: event.price || undefined,
        imageUrl: event.imageUrl || '',
        isPublished: event.isPublished,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        eventType: '',
        startDate: '',
        endDate: '',
        location: '',
        maxParticipants: undefined,
        isPaid: false,
        price: undefined,
        imageUrl: '',
        isPublished: false,
      });
    }
  }, [event, form]);

  const isPaid = form.watch('isPaid');

  const onSubmit = async (data: EventFormData) => {
    try {
      const payload = {
        ...data,
        maxParticipants: data.maxParticipants ?? undefined,
        price: data.isPaid ? (data.price ?? 0) : 0,
        imageUrl: data.imageUrl || undefined,
      };

      if (isEditing) {
        await api.put(`/y2c/events/${event!.id}`, payload);
        toast.success('Événement mis à jour');
      } else {
        await api.post('/y2c/events', payload);
        toast.success('Événement créé');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de l’opération';
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (!form.formState.isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── En-tête ──────────────────────────────────── */}
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                  <CalendarPlus className="h-5 w-5 text-secondary" />
                  {isEditing ? 'Modifier l’événement' : 'Nouvel événement Y2C'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifiez les informations de l’événement.'
                    : 'Créez un nouvel événement pour la communauté.'}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* ─── Formulaire ───────────────────────────────── */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Titre */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Hack a Town 2025" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Décrivez l’événement..." rows={3} {...field} disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type <span className="text-destructive">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Début <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="datetime-local" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="datetime-local" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lieu */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Antananarivo, Madagascar" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Participants max */}
                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants max</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="50" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>Laissez vide si illimité.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Paiement */}
                <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                  <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Événement payant</FormLabel>
                          <FormDescription>Activez si les participants doivent payer.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} disabled={form.formState.isSubmitting} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {isPaid && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (Ar)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input type="number" placeholder="25000" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Image */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l’image</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="url" placeholder="https://exemple.com/image.jpg" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>Optionnelle.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Publication */}
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publier l’événement</FormLabel>
                        <FormDescription>Visible sur le site public.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={form.formState.isSubmitting} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Boutons */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[140px] gap-2">
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditing ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="h-4 w-4" />
                        {isEditing ? 'Mettre à jour' : 'Créer l’événement'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}