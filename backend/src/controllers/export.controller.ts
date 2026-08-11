import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { ExportService } from '../services/export.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ExportController extends BaseController {
  private exportService: ExportService;

  constructor() {
    super();
    this.exportService = new ExportService();
  }

  exportRegistrations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportRegistrations(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportMembers(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportPayments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportPayments(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportFormations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportFormations(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportProjects(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportArticles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format } = req.params;
      const filters = this.getSearchParams(req);
      
      const result = await this.exportService.exportArticles(
        format as 'csv' | 'excel' | 'pdf',
        filters
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.buffer);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}