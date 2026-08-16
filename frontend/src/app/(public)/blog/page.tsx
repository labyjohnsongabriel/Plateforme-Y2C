// app/(public)/blog/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArticleGrid } from './components/ArticleGrid';
import { ArticleCategories } from './components/ArticleCategories';
import { articles } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articles.getPublished();
        const data = response?.data?.data ?? response?.data ?? [];
        setArticlesList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur chargement articles:', error);
        toast.error('Impossible de charger les articles');
        setArticlesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filtrage des articles
  const filteredArticles = useMemo(() => {
    let filtered = articlesList;

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(term) ||
          a.excerpt?.toLowerCase().includes(term) ||
          a.category?.toLowerCase().includes(term) ||
          a.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [articlesList, selectedCategory, searchTerm]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Articles</h1>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ArticleGrid articles={filteredArticles} loading={loading} />
          </div>
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-20">
              <ArticleCategories
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}