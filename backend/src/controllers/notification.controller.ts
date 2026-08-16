// backend/src/controllers/notification.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificationController extends BaseController {
  private notificationService: NotificationService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
  }

  /**
   * Récupère les notifications de l'utilisateur connecté
   * GET /api/notifications
   */
  getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('Utilisateur non authentifié');
      }
      const userId = req.user.id;
      const pagination = this.getPaginationParams(req);
      const result = await this.notificationService.getByUser(userId, pagination);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * Marque une notification comme lue
   * PATCH /api/notifications/:id/read
   */
  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('Utilisateur non authentifié');
      }
      const { id } = req.params;
      const userId = req.user.id;
      const notification = await this.notificationService.markAsRead(id, userId);
      this.sendUpdated(res, notification);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * Marque toutes les notifications comme lues
   * POST /api/notifications/read-all
   */
  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('Utilisateur non authentifié');
      }
      const userId = req.user.id;
      const result = await this.notificationService.markAllAsRead(userId);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * Récupère le nombre de notifications non lues
   * GET /api/notifications/unread-count
   */
  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('Utilisateur non authentifié');
      }
      const userId = req.user.id;
      const result = await this.notificationService.getUnreadCount(userId);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}