'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../../../components/shared/PageTransition';
import { NewsFeed } from './components/NewsFeed';
import { articles } from '../../../lib/api';

export default function ActualitesPage() {
  const [articlesData, setArticlesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articles.getPublished();
        setArticlesData(response.data.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <PageTransition>
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Actualités <span className="text-secondary">Youth Computing</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Restez informé des dernières nouvelles
          </p>
        </motion.div>

        <NewsFeed articles={articlesData} loading={isLoading} />
      </div>
    </PageTransition>
  );
}