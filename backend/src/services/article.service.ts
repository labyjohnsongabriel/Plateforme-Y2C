import { ArticleRepository } from '../repositories/article.repository';
import { ArticleCommentRepository } from '../repositories/articleComment.repository';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  CreateArticleCommentDTO,
} from '../types/dto/article.dto';
import { ApiError } from '../utils/ApiError';
import { Article, ArticleStatus } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { prisma } from '../config/prisma';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private commentRepository: ArticleCommentRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.commentRepository = new ArticleCommentRepository();
  }

  // ─── CRUD de base ──────────────────────────────────────────
  async findAll(params?: any): Promise<Article[]> {
    return this.articleRepository.findMany(params);
  }

  async findAllPaginated(page: number, limit: number) {
    return this.articleRepository.findPaginated({
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Article> {
    return this.articleRepository.findByIdOrThrow(id);
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateArticleDTO, authorId: string): Promise<Article> {
    // Vérifier que l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (!userExists) {
      throw ApiError.notFound('Utilisateur introuvable');
    }

    // Générer le slug avec le modèle 'article'
    const slug = await generateUniqueSlug(data.title, 'article');

    if (!data.category) {
      throw ApiError.badRequest('Le champ "category" est obligatoire');
    }
    if (!data.tags) {
      data.tags = [];
    }

    // ✅ Utilisation de l'enum ArticleStatus de Prisma
    const status = (data.status as ArticleStatus) || ArticleStatus.DRAFT;
    const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

    const articleData = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      category: data.category,
      tags: data.tags,
      status,
      isFeatured: data.isFeatured || false,
      publishedAt,
      User: { connect: { id: authorId } },
    };

    try {
      const article = await this.articleRepository.create(articleData);
      if (article.status === ArticleStatus.PUBLISHED) {
        await this.notifySubscribers(article);
      }
      return article;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'article:', error);
      throw error;
    }
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateArticleDTO): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);

    let slug = article.slug;
    if (data.title && data.title !== article.title) {
      slug = await generateUniqueSlug(data.title, 'article');
    }

    const updateData: any = { ...data, slug };
    if (data.status) {
      const status = data.status as ArticleStatus;
      updateData.status = status;
      if (status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
        updateData.publishedAt = new Date();
      } else if (status === ArticleStatus.DRAFT && article.status === ArticleStatus.PUBLISHED) {
        updateData.publishedAt = null;
      }
    }

    const updated = await this.articleRepository.update(id, updateData);
    if (data.status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
      await this.notifySubscribers(updated);
    }
    return updated;
  }

  // ─── DELETE ────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await this.articleRepository.delete(id);
  }

  // ─── PUBLISH / UNPUBLISH ──────────────────────────────────
  async publish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status === ArticleStatus.PUBLISHED) {
      throw ApiError.badRequest('Article déjà publié');
    }
    const updated = await this.articleRepository.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    await this.notifySubscribers(updated);
    return updated;
  }

  async unpublish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status !== ArticleStatus.PUBLISHED) {
      throw ApiError.badRequest('Article non publié');
    }
    return this.articleRepository.update(id, {
      status: ArticleStatus.DRAFT,
      publishedAt: null,
    });
  }

  // ─── AUTRES MÉTHODES ──────────────────────────────────────
  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.incrementViews(id);
  }

  async getBySlug(slug: string): Promise<Article | null> {
    return this.articleRepository.findBySlug(slug);
  }

  async getPublishedArticlesPaginated(page: number, limit: number) {
    return this.articleRepository.findPublishedPaginated(page, limit);
  }

  async getPublishedArticles(params?: { skip?: number; take?: number; orderBy?: any }): Promise<Article[]> {
    return this.articleRepository.findPublished(params);
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return this.articleRepository.findByAuthor(authorId);
  }

  async getStats() {
    return this.articleRepository.getStats();
  }

  async getMostViewed(limit: number = 5): Promise<Article[]> {
    return this.articleRepository.getMostViewed(limit);
  }

  async searchArticles(query: string): Promise<Article[]> {
    return this.articleRepository.search(query);
  }

  // ─── COMMENTAIRES ──────────────────────────────────────────
  async createComment(data: CreateArticleCommentDTO): Promise<any> {
    await this.articleRepository.findByIdOrThrow(data.articleId);

    const commentData: any = {
      content: data.content,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      isApproved: false,
      articleId: data.articleId,
      parentId: data.parentId || null,
    };

    const comment = await this.commentRepository.create(commentData);
    try {
      await this.notifyComment(comment);
    } catch (error) {
      logger.error('Échec de l’envoi de la notification de commentaire :', error);
    }
    return comment;
  }

  async approveComment(id: string): Promise<any> {
    return this.commentRepository.update(id, { isApproved: true });
  }

  async getArticleComments(articleId: string): Promise<any[]> {
    return this.commentRepository.findByArticle(articleId);
  }

  async deleteComment(id: string): Promise<void> {
    await this.commentRepository.delete(id);
  }

  // ─── HELPERS ───────────────────────────────────────────────
  private async notifySubscribers(article: Article): Promise<void> {
    try {
      logger.info(`Article publié : ${article.title}`);
    } catch (error) {
      logger.error('Échec de la notification aux abonnés :', error);
    }
  }

  private async notifyComment(comment: any): Promise<void> {
    try {
      await mailer.sendTemplatedEmail(
        process.env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
        'new-comment',
        {
          content: `
            <h2>Nouveau commentaire</h2>
            <p><strong>Auteur :</strong> ${comment.authorName}</p>
            <p><strong>Email :</strong> ${comment.authorEmail}</p>
            <p><strong>Commentaire :</strong> ${comment.content}</p>
            <p><a href="${process.env.FRONTEND_URL}/admin/comments/${comment.id}">Approuver</a></p>
          `,
        }
      );
    } catch (error) {
      logger.error('Échec de l’envoi de la notification de commentaire :', error);
    }
  }
}