// src/app/(public)/blog/components/ArticleCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Author {
  firstName?: string;
  lastName?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  author?: Author;
}

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const {
    title,
    slug,
    featuredImage,
    publishedAt,
    createdAt,
    author,
    excerpt,
    content,
    tags = [],
  } = article;

  // Fallback pour l'image
  const hasImage = !!featuredImage;
  const imageUrl = hasImage ? featuredImage : undefined;

  // Extraction du texte brut pour l'extrait
  const getExcerpt = () => {
    if (excerpt) return excerpt;
    if (content) {
      const plainText = content.replace(/<[^>]*>/g, '').slice(0, 150);
      return plainText + (content.length > 150 ? '...' : '');
    }
    return 'Lire cet article...';
  };

  const displayExcerpt = getExcerpt();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-5xl font-bold text-primary/20">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(publishedAt || createdAt)}</span>
            {author && (
              <>
                <span>•</span>
                <User className="h-4 w-4" />
                <span>{`${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Auteur'}</span>
              </>
            )}
          </div>
          <CardTitle className="font-ubuntu text-xl leading-tight">
            <Link href={`/blog/${slug}`} className="hover:text-secondary transition-colors line-clamp-2">
              {title}
            </Link>
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {displayExcerpt}
          </p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter>
          <Button asChild variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
            <Link href={`/blog/${slug}`}>
              Lire la suite
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}