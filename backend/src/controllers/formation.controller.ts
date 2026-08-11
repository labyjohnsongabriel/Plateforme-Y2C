import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { FormationService } from '../services/formation.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../config/logger';

export class FormationController extends BaseController {
  private formationService: FormationService;

  constructor() {
    super();
    this.formationService = new FormationService();
  }

  /**
   * Récupère toutes les formations avec pagination et recherche
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      
      let formations;
      if (search) {
        formations = await this.formationService.searchFormations(search);
      } else {
        formations = await this.formationService.findAll(pagination);
      }
      
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getAll formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère une formation par son slug
   */
  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const formation = await this.formationService.findBySlug(slug);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getBySlug formation ${req.params.slug}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère une formation par son ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.findById(id);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getById formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Crée une nouvelle formation
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const formation = await this.formationService.create(req.body);
      this.sendCreated(res, formation);
    } catch (error) {
      logger.error('Error in create formation:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Met à jour une formation
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.update(id, req.body);
      this.sendUpdated(res, formation);
    } catch (error) {
      logger.error(`Error in update formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Supprime une formation
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.formationService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      logger.error(`Error in delete formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations publiées
   */
  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findPublished(pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getPublished formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations par catégorie
   */
  getByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findByCategory(category, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error(`Error in getByCategory formation ${req.params.category}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations par niveau
   */
  getByLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { level } = req.params;
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findByLevel(level, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error(`Error in getByLevel formation ${req.params.level}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les statistiques des formations
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.formationService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Error in getStats formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations les plus populaires
   */
  getMostPopular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const formations = await this.formationService.getMostPopular(limit);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getMostPopular formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère une formation avec ses sessions
   */
  getWithSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.findWithSessions(id);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getWithSessions formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations recommandées
   */
  getRecommended = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const formations = await this.formationService.getRecommended(limit);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getRecommended formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Récupère les formations avec filtres avancés
   */
  getFiltered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        category: req.query.category as string,
        level: req.query.level as string,
        isPublished: req.query.isPublished === 'true',
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findFiltered(filters, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getFiltered formations:', error);
      this.handleError(next, error);
    }
  };

  /**
   * Publie ou dépublie une formation
   */
  togglePublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.togglePublish(id);
      this.sendUpdated(res, formation);
    } catch (error) {
      logger.error(`Error in togglePublish formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  /**
   * Met à jour les métriques d'une formation
   */
  updateMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const metrics = req.body;
      const formation = await this.formationService.updateMetrics(id, metrics);
      this.sendUpdated(res, formation);
    } catch (error) {
      logger.error(`Error in updateMetrics formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };
}