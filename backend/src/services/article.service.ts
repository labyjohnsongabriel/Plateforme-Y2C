import { ArticleRepository } from '../repositories/article.repository';
import { ArticleCommentRepository } from '../repositories/articleComment.repository';
import { CreateArticleDTO, UpdateArticleDTO, CreateArticleCommentDTO } from '../types/dto/article.dto';
import { ApiError } from '../utils/ApiError';
import { Article } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private commentRepository: ArticleCommentRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.commentRepository = new ArticleCommentRepository();
  }

  // ============ CRUD de base ============
  async findAll(params?: any): Promise<Article[]> {
    return this.articleRepository.findMany(params);
  }

  async findById(id: string): Promise<Article> {
    return this.articleRepository.findByIdOrThrow(id);
  }

  async create(data: CreateArticleDTO, authorId: string): Promise<Article> {
    const slug = await generateUniqueSlug(data.title, this.articleRepository, 'slug');
    const article = await this.articleRepository.create({
      ...data,
      slug,
      status: data.status || 'DRAFT',
      // ✅ Utilisation de la relation Prisma pour l'auteur
      author: {
        connect: { id: authorId }
      }
    });
    if (article.status === 'PUBLISHED') {
      await this.notifySubscribers(article);
    }
    return article;
  }

  async update(id: string, data: UpdateArticleDTO): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    let slug = article.slug;
    if (data.title && data.title !== article.title) {
      slug = await generateUniqueSlug(data.title, this.articleRepository, 'slug');
    }
    const updated = await this.articleRepository.update(id, { ...data, slug });
    if (data.status === 'PUBLISHED' && article.status !== 'PUBLISHED') {
      await this.notifySubscribers(updated);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.articleRepository.delete(id);
  }

  // ============ Méthodes spécifiques ============
  async publish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status === 'PUBLISHED') {
      throw ApiError.badRequest('Article already published');
    }
    const updated = await this.articleRepository.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
    await this.notifySubscribers(updated);
    return updated;
  }

  async unpublish(id: string): Promise<Article> {
    const article = await this.articleRepository.findByIdOrThrow(id);
    if (article.status !== 'PUBLISHED') {
      throw ApiError.badRequest('Article is not published');
    }
    return this.articleRepository.update(id, {
      status: 'DRAFT',
      publishedAt: null,
    });
  }

  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.incrementViews(id);
  }

  async getBySlug(slug: string): Promise<Article | null> {
    return this.articleRepository.findBySlug(slug);
  }

  async getPublishedArticles(params: any): Promise<any> {
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

  // ============ COMMENTAIRES ============
  async createComment(data: CreateArticleCommentDTO): Promise<any> {
    await this.articleRepository.findByIdOrThrow(data.articleId);

    // Construction de l'objet de création avec les relations Prisma
    const commentData: any = {
      content: data.content,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      isApproved: false,
      article: {
        connect: { id: data.articleId }
      }
    };

    // Si parentId est fourni, on connecte le commentaire parent
    if (data.parentId) {
      commentData.parent = {
        connect: { id: data.parentId }
      };
    }

    const comment = await this.commentRepository.create(commentData);

    try {
      await this.notifyComment(comment);
    } catch (error) {
      logger.error('Failed to send comment notification:', error);
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

  // ============ HELPERS ============
  private async notifySubscribers(article: Article): Promise<void> {
    try {
      logger.info(`Article published: ${article.title}`);
    } catch (error) {
      logger.error('Failed to notify subscribers:', error);
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
            <p><strong>Auteur:</strong> ${comment.authorName}</p>
            <p><strong>Email:</strong> ${comment.authorEmail}</p>
            <p><strong>Commentaire:</strong> ${comment.content}</p>
            <p><a href="${process.env.FRONTEND_URL}/admin/comments/${comment.id}">Approuver</a></p>
          `,
        }
      );
    } catch (error) {
      logger.error('Failed to send comment notification:', error);
    }
  }
}