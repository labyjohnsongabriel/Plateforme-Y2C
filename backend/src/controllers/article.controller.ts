import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { ArticleService } from '../services/article.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ArticleController extends BaseController {
  private articleService: ArticleService;

  constructor() {
    super();
    this.articleService = new ArticleService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      
      let articles;
      if (search) {
        // ✅ Utilise la méthode searchArticles maintenant disponible
        articles = await this.articleService.searchArticles(search);
      } else {
        articles = await this.articleService.findAll(pagination);
      }
      
      this.sendSuccess(res, articles);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const articles = await this.articleService.getPublishedArticles(pagination);
      this.sendSuccess(res, articles);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const article = await this.articleService.getBySlug(slug);
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      await this.articleService.incrementViews(article.id);
      this.sendSuccess(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.findById(id);
      this.sendSuccess(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ✅ Correction : utilisation directe de req.user.id
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const article = await this.articleService.create(req.body, userId);
      this.sendCreated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.update(id, req.body);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.articleService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.publish(id);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  unpublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const article = await this.articleService.unpublish(id);
      this.sendUpdated(res, article);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.articleService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMostViewed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const articles = await this.articleService.getMostViewed(limit);
      this.sendSuccess(res, articles);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ COMMENTS ============
  createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.articleService.createComment(req.body);
      this.sendCreated(res, comment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  approveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const comment = await this.articleService.approveComment(id);
      this.sendUpdated(res, comment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.articleService.deleteComment(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getArticleComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { articleId } = req.params;
      const comments = await this.articleService.getArticleComments(articleId);
      this.sendSuccess(res, comments);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}