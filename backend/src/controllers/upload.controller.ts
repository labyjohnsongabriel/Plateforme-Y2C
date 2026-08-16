import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { FileService } from '../services/file.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UploadController extends BaseController {
  private fileService: FileService;

  constructor() {
    super();
    this.fileService = new FileService();
  }

  uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // ✅ Le service retourne déjà un objet avec l'URL absolue
      const result = await this.fileService.uploadFile(req.file, userId);
      this.sendCreated(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  uploadMultiple = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        throw new Error('No files uploaded');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const results = await this.fileService.uploadMultipleFiles(req.files, userId);
      this.sendCreated(res, results);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.fileService.deleteFile(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getFiles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const files = await this.fileService.getFiles(pagination);
      this.sendSuccess(res, files);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await this.fileService.getFile(id);
      this.sendSuccess(res, file);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}