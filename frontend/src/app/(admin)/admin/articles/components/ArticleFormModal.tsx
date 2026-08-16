// app/(admin)/admin/articles/components/ArticleFormModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  FileText,
  Tag,
  Loader2,
  X,
  Star,
  Pencil,
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
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Article } from './ArticlesTable';

// ─── Types ──────────────────────────────────────────────────
const CATEGORIES = [
  'Actualités',
  'Formations',
  'Événements',
  'Projets',
  'Témoignages',
  'Technologie',
  'Autre',
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'ARCHIVED', label: 'Archivé' },
  { value: 'SCHEDULED', label: 'Programmé' },
];

// ─── Schéma de validation ──────────────────────────────────
const articleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  content: z.string().min(20, 'Le contenu doit contenir au moins 20 caractères'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  tags: z.string().optional(),
  status: z.string().default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null; // pour l'édition
  onSuccess?: () => void;
}

// ─── Composant Modal ────────────────────────────────────────
export function ArticleFormModal({
  open,
  onOpenChange,
  article,
  onSuccess,
}: ArticleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!article;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      status: 'DRAFT',
      isFeatured: false,
    },
  });

  // Remplir le formulaire en mode édition
  useEffect(() => {
    if (open && article) {
      form.reset({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: article.tags?.join(', ') || '',
        status: article.status || 'DRAFT',
        isFeatured: article.isFeatured || false,
      });
    }
    if (open && !article) {
      form.reset({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        status: 'DRAFT',
        isFeatured: false,
      });
    }
  }, [open, article, form]);

  const isFeatured = form.watch('isFeatured');
  const status = form.watch('status');
  const isPublished = status === 'PUBLISHED';

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
      };
      
      if (isEditing && article) {
        await articles.update(article.id, payload);
        toast.success('Article modifié avec succès ✅');
      } else {
        await articles.create(payload);
        toast.success('Article créé avec succès 🎉');
      }
      
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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
                  {isEditing ? (
                    <Pencil className="h-5 w-5 text-secondary" />
                  ) : (
                    <FileText className="h-5 w-5 text-secondary" />
                  )}
                  {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifiez les informations de l\'article existant.'
                    : 'Créez un nouvel article pour le blog.'}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* ─── Formulaire ───────────────────────────────── */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* ── Titre ── */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Titre <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Titre de l’article..."
                            className="pl-9"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Catégorie ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Catégorie <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Tags ── */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="React, Next.js, Formation"
                              className="pl-9"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Séparez par des virgules.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Extrait ── */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Résumé de l’article..."
                          rows={2}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Optionnel – utilisé pour les aperçus.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Contenu ── */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contenu <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contenu complet de l’article..."
                          rows={8}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* ── Options ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* ── Statut ── */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isPublished
                            ? 'L’article sera visible sur le site.'
                            : 'L’article restera en brouillon.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Vedette ── */}
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end space-y-1.5">
                        <FormLabel>Article vedette</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 pt-1">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? '⭐ Mis en avant' : 'Standard'}
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Apparaîtra en première page du blog.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ─── Boutons ─────────────────────────────── */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="sm:min-w-[100px]"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px] gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditing ? 'Modification...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {isEditing ? 'Modifier l\'article' : 'Créer l\'article'}
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