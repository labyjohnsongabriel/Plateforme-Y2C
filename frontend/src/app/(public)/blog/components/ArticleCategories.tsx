// src/app/(public)/blog/components/ArticleCategories.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  name: string;
  count: number;
}

interface ArticleCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function ArticleCategories({
  selectedCategory,
  onSelectCategory,
}: ArticleCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await articles.getPublished();
      // ✅ Extraction sécurisée des données
      const rawData = response?.data?.data ?? response?.data ?? [];
      const articlesData = Array.isArray(rawData) ? rawData : [];

      // Comptage des catégories
      const categoryMap = new Map<string, number>();
      articlesData.forEach((article: any) => {
        const category = article.category?.trim() || 'Non classé';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const sorted: Category[] = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCategories(sorted);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Impossible de charger les catégories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalArticles = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg">Catégories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Tous les articles */}
        <Button
          variant={!selectedCategory ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start font-medium"
          onClick={() => onSelectCategory('')}
        >
          Tous les articles
          <span className="ml-auto text-xs text-muted-foreground">{totalArticles}</span>
        </Button>

        {/* Catégories */}
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant={selectedCategory === cat.name ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => onSelectCategory(cat.name)}
          >
            {cat.name}
            <span className="ml-auto text-xs text-muted-foreground">{cat.count}</span>
          </Button>
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune catégorie disponible
          </p>
        )}
      </CardContent>
    </Card>
  );
}