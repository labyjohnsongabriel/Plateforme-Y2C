import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      
      let users;
      if (search) {
        users = await this.userService.searchUsers(search);
      } else {
        users = await this.userService.findAll(pagination);
      }
      
      this.sendSuccess(res, users);
    } catch (error) {
      logger.error('Error in getAll users:', error);
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      this.sendSuccess(res, user);
    } catch (error) {
      logger.error(`Error in getById user ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.create(req.body);
      this.sendCreated(res, user);
    } catch (error) {
      logger.error('Error in create user:', error);
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.update(id, req.body);
      this.sendUpdated(res, user);
    } catch (error) {
      logger.error(`Error in update user ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.hardDelete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      logger.error(`Error in delete user ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.toggleActive(id);
      this.sendUpdated(res, user);
    } catch (error) {
      logger.error(`Error in toggleActive user ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.userService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Error in getStats users:', error);
      this.handleError(next, error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserIdFromAuth(req);
      const user = await this.userService.findById(userId);
      this.sendSuccess(res, user);
    } catch (error) {
      logger.error('Error in getProfile:', error);
      this.handleError(next, error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserIdFromAuth(req);
      const user = await this.userService.update(userId, req.body);
      this.sendUpdated(res, user);
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      this.handleError(next, error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserIdFromAuth(req);
      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(userId, currentPassword, newPassword);
      this.sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Error in changePassword:', error);
      this.handleError(next, error);
    }
  };

  private getUserIdFromAuth(req: AuthRequest): string {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }
    return req.user.id;
  }
}