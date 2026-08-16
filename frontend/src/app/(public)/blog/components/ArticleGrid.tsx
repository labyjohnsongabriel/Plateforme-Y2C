// src/app/(public)/blog/components/ArticleGrid.tsx
'use client';

import { ArticleCard, type Article } from './ArticleCard';

interface ArticleGridProps {
  articles?: Article[] | null;
  loading?: boolean;
}

export function ArticleGrid({ articles = [], loading = false }: ArticleGridProps) {
  // ✅ Sécurisation : s'assurer que articles est un tableau
  const safeArticles = Array.isArray(articles) ? articles : [];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (safeArticles.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">Aucun article trouvé</p>
        <p className="text-sm text-muted-foreground/60">Revenez plus tard pour découvrir de nouveaux contenus.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {safeArticles.map((article, index) => (
        <ArticleCard key={article.id || `article-${index}`} article={article} index={index} />
      ))}
    </div>
  );
}