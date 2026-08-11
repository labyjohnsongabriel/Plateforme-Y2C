import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DashboardController extends BaseController {
  private dashboardService: DashboardService;

  constructor() {
    super();
    this.dashboardService = new DashboardService();
  }

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dashboardService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getChartData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, period } = req.query;
      const data = await this.dashboardService.getChartData(
        type as string,
        period as string
      );
      this.sendSuccess(res, data);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await this.dashboardService.getRecentActivities(limit);
      this.sendSuccess(res, activities);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ✅ Correction : utilise req.user.id au lieu de this.getUserId(req)
  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const notifications = await this.dashboardService.getNotifications(userId);
      this.sendSuccess(res, notifications);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getQuickStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dashboardService.getQuickStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const performance = await this.dashboardService.getPerformance();
      this.sendSuccess(res, performance);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getWidgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const widgets = await this.dashboardService.getWidgets();
      this.sendSuccess(res, widgets);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}