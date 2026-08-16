import { BaseRepository } from './base.repository';
import { Prisma, ArticleComment } from '@prisma/client';
import { prisma } from '../config/prisma';

export class ArticleCommentRepository extends BaseRepository<
  ArticleComment,
  Prisma.ArticleCommentWhereInput,
  Prisma.ArticleCommentCreateInput,
  Prisma.ArticleCommentUpdateInput
> {
  constructor() {
    super('articleComment');
  }

  async findByArticle(articleId: string): Promise<ArticleComment[]> {
    return this.findMany({
      where: {
        articleId,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findReplies(commentId: string): Promise<ArticleComment[]> {
    return this.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findApprovedByArticle(articleId: string): Promise<ArticleComment[]> {
    return this.findMany({
      where: {
        articleId,
        isApproved: true,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findPending(): Promise<ArticleComment[]> {
    return this.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countByArticle(articleId: string): Promise<number> {
    return this.count({
      articleId,
      isApproved: true,
    });
  }

  async countPending(): Promise<number> {
    return this.count({ isApproved: false });
  }

  async getStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    byArticle: Record<string, number>;
  }> {
    const [total, approved, pending] = await Promise.all([
      this.count(),
      this.count({ isApproved: true }),
      this.count({ isApproved: false }),
    ]);

    // ✅ Utilisation de prisma directement
    const result = await prisma.articleComment.groupBy({
      by: ['articleId'],
      _count: { articleId: true },
    });

    const byArticle = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.articleId] = item._count.articleId;
      return acc;
    }, {});

    return {
      total,
      approved,
      pending,
      byArticle,
    };
  }

  async findWithReplies(id: string): Promise<ArticleComment | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: {
          replies: {
            where: { isApproved: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }
}