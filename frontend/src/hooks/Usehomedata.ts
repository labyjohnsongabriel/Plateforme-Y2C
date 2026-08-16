import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Article, Stats } from '@/types';

export interface HomeData {
  stats: Stats;
  articles: Article[];
}

const fetchHomeData = async (): Promise<HomeData> => {
  const [statsRes, articlesRes] = await Promise.all([
    api.get('/stats/global'),
    api.get('/articles/published?limit=3&sort=desc'),
  ]);
  return {
    stats: statsRes.data.data,
    articles: articlesRes.data.data || [],
  };
};

export const useHomeData = (
  options?: Omit<UseQueryOptions<HomeData, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HomeData, Error>({
    queryKey: ['homeData'],
    queryFn: fetchHomeData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

export const useHomeStats = (
  options?: Omit<UseQueryOptions<Stats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Stats, Error>({
    queryKey: ['homeStats'],
    queryFn: async () => {
      const res = await api.get('/stats/global');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useHomeArticles = (
  limit: number = 3,
  options?: Omit<UseQueryOptions<Article[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Article[], Error>({
    queryKey: ['homeArticles', limit],
    queryFn: async () => {
      const res = await api.get(`/articles/published?limit=${limit}&sort=desc`);
      const data = res.data?.data;
      // ✅ Garantir un tableau
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};