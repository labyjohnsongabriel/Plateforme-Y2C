import { Formation, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { NotFoundException } from '../exceptions';
import { logger } from '../config/logger';

interface FormationWhereInput {
  title?: { contains: string; mode: 'insensitive' };
  slug?: string;
  category?: string;
  level?: string;
  isPublished?: boolean;
  OR?: any[];
  AND?: any[];
}

interface FormationCreateInput {
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price?: number;
  category: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

interface FormationUpdateInput {
  title?: string;
  slug?: string;
  description?: string;
  objectives?: string;
  prerequisites?: string;
  duration?: string;
  level?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

export class FormationRepository extends BaseRepository<
  Formation,
  FormationWhereInput,
  FormationCreateInput,
  FormationUpdateInput
> {
  constructor() {
    super('formation');
  }

  /**
   * Trouve une formation par son slug
   */
  async findBySlug(slug: string): Promise<Formation | null> {
    return this.findFirst({ slug } as FormationWhereInput);
  }

  /**
   * Trouve une formation par son slug ou lève une erreur
   */
  async findBySlugOrThrow(slug: string): Promise<Formation> {
    const formation = await this.findBySlug(slug);
    if (!formation) {
      throw NotFoundException.slug(slug);
    }
    return formation;
  }

  /**
   * Récupère les formations publiées
   */
  async findPublished(pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { isPublished: true } as FormationWhereInput;
    
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    
    return this.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les formations par catégorie
   */
  async findByCategory(category: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { category } as FormationWhereInput;
    
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    
    return this.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les formations par niveau
   */
  async findByLevel(level: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where = { level } as FormationWhereInput;
    
    if (pagination) {
      const result = await this.findPaginated({
        where,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    
    return this.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Recherche des formations
   */
  async searchFormations(search: string): Promise<Formation[]> {
    return this.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      } as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les statistiques des formations
   */
  async getStats() {
    const [total, published, unpublished, byCategory, byLevel] = await Promise.all([
      this.count(),
      this.count({ isPublished: true } as FormationWhereInput),
      this.count({ isPublished: false } as FormationWhereInput),
      this.getCountByCategory(),
      this.getCountByLevel(),
    ]);

    return {
      total,
      published,
      unpublished,
      byCategory,
      byLevel,
    };
  }

  /**
   * Récupère le nombre de formations par catégorie
   */
  async getCountByCategory(): Promise<Record<string, number>> {
    const formations = await this.findMany();
    return formations.reduce((acc, formation) => {
      acc[formation.category] = (acc[formation.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Récupère le nombre de formations par niveau
   */
  async getCountByLevel(): Promise<Record<string, number>> {
    const formations = await this.findMany();
    return formations.reduce((acc, formation) => {
      acc[formation.level] = (acc[formation.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Récupère les formations les plus populaires
   */
  async getMostPopular(limit: number = 5): Promise<Formation[]> {
    // Note: Adaptez selon votre modèle de données
    // Si vous avez un champ de vue ou d'inscription, utilisez-le pour le tri
    return this.findMany({
      where: { isPublished: true } as FormationWhereInput,
      orderBy: { createdAt: 'desc' }, // Remplacer par le champ de popularité
      take: limit,
    });
  }

  /**
   * Récupère une formation avec ses sessions
   */
  async findWithSessions(id: string): Promise<Formation | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          sessions: {
            orderBy: { startDate: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Récupère les formations recommandées
   */
  async getRecommended(limit: number = 5): Promise<Formation[]> {
    // Note: Adaptez selon votre logique de recommandation
    return this.findMany({
      where: { isPublished: true } as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupère les formations avec filtres avancés
   */
  async findFiltered(filters: {
    category?: string;
    level?: string;
    isPublished?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (pagination) {
      const result = await this.findPaginated({
        where: where as FormationWhereInput,
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }

    return this.findMany({
      where: where as FormationWhereInput,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Met à jour les métriques d'une formation
   */
  async updateMetrics(id: string, metrics: { views?: number; registrations?: number }): Promise<Formation> {
    return this.update(id, metrics as FormationUpdateInput);
  }

  /**
   * Publie ou dépublie une formation
   */
  async togglePublish(id: string): Promise<Formation> {
    const formation = await this.findByIdOrThrow(id);
    return this.update(id, { isPublished: !formation.isPublished } as FormationUpdateInput);
  }

  /**
   * Vérifie si un slug existe déjà
   */
  async slugExists(slug: string): Promise<boolean> {
    const formation = await this.findBySlug(slug);
    return !!formation;
  }

  /**
   * Récupère les formations avec leurs relations
   */
  async findWithRelations(id: string): Promise<Formation | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          sessions: {
            include: {
              registrations: true,
            },
          },
          registrations: true,
        },
      });
    });
  }

  /**
   * Récupère les formations récentes
   */
  async findRecent(limit: number = 10): Promise<Formation[]> {
    return this.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Récupère les formations par prix
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Formation[]> {
    return this.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      } as any,
      orderBy: { price: 'asc' },
    });
  }
}