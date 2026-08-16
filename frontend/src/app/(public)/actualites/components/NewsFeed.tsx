'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { formatDate } from '../../../../lib/utils';

export function NewsFeed({ articles, loading }: { articles: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
        >
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6">
              <Link href={`/blog/${article.slug}`} className="block">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.author?.firstName} {article.author?.lastName}</span>
                  </div>
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
                <h3 className="mt-2 font-ubuntu text-xl font-semibold hover:text-secondary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-muted-foreground">
                  {article.excerpt || article.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-secondary">
                  Lire la suite
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}