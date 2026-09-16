import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { SettingService } from '../services/setting.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/ApiError';
import prisma from '../../prisma/client';

export class SettingController extends BaseController {
  private settingService: SettingService;

  constructor() {
    super();
    this.settingService = new SettingService();
    // Initialisation auto
    this.settingService.initializeSettings().catch(console.error);
  }

  // ─── Récupérer tous les paramètres (admin) ──────────────────
  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingService.getAllSettings();
      this.sendSuccess(res, settings);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Récupérer les paramètres publics ──────────────────────────
  getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingService.getPublicSettings();
      this.sendSuccess(res, settings);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Récupérer un groupe spécifique (admin) ──────────────────
  getGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { group } = req.params;
      const settings = await this.settingService.getGroup(group);
      this.sendSuccess(res, settings);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Récupérer un paramètre par clé (admin) ──────────────────
  getByKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const value = await this.settingService.getSetting(key, true);
      this.sendSuccess(res, { key, value });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Mettre à jour tout un groupe ──────────────────────────────
  updateGroup = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { group } = req.params;
      const data = req.body;
      await this.settingService.updateGroup(group, data);
      this.sendUpdated(res, { group, message: 'Paramètres mis à jour' });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Mettre à jour un paramètre individuel ──────────────────
  updateSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (value === undefined) throw ApiError.badRequest('La valeur est requise');

      const [group] = key.split('.');
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          group,
          label: key.split('.').pop(),
          isPublic: group === 'public',
        },
      });
      this.sendUpdated(res, { key, value });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Réinitialiser les paramètres ──────────────────────────
  reset = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.settingService.resetSettings();
      this.sendSuccess(res, { message: 'Paramètres réinitialisés' });
    } catch (error) {
      this.handleError(next, error);
    }
  };
}