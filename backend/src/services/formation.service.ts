import { BaseService } from './base.service';
import { FormationRepository } from '../repositories/formation.repository';
import { CreateFormationDTO, UpdateFormationDTO } from '../types/dto/formation.dto';
import { Formation } from '@prisma/client';
import { NotFoundException, ConflictException } from '../exceptions';
import { logger } from '../config/logger';

export class FormationService extends BaseService<Formation, CreateFormationDTO, UpdateFormationDTO> {
  private formationRepository: FormationRepository;

  constructor() {
    super(new FormationRepository());
    this.formationRepository = new FormationRepository();
  }

  async findBySlug(slug: string): Promise<Formation> {
    try {
      const formation = await this.formationRepository.findBySlug(slug);
      if (!formation) {
        throw NotFoundException.slug(slug);
      }
      return formation;
    } catch (error) {
      logger.error(`Error in findBySlug ${slug}:`, error);
      throw error;
    }
  }

  async findPublished(pagination?: { page: number; limit: number }): Promise<Formation[]> {
    try {
      return await this.formationRepository.findPublished(pagination);
    } catch (error) {
      logger.error('Error in findPublished:', error);
      throw error;
    }
  }

  async findByCategory(category: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    try {
      return await this.formationRepository.findByCategory(category, pagination);
    } catch (error) {
      logger.error(`Error in findByCategory ${category}:`, error);
      throw error;
    }
  }

  async findByLevel(level: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    try {
      return await this.formationRepository.findByLevel(level, pagination);
    } catch (error) {
      logger.error(`Error in findByLevel ${level}:`, error);
      throw error;
    }
  }

  async searchFormations(search: string): Promise<Formation[]> {
    try {
      return await this.formationRepository.searchFormations(search);
    } catch (error) {
      logger.error(`Error in searchFormations ${search}:`, error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await this.formationRepository.getStats();
    } catch (error) {
      logger.error('Error in getStats:', error);
      throw error;
    }
  }

  async getMostPopular(limit: number = 5): Promise<Formation[]> {
    try {
      return await this.formationRepository.getMostPopular(limit);
    } catch (error) {
      logger.error('Error in getMostPopular:', error);
      throw error;
    }
  }

  async findWithSessions(id: string): Promise<Formation | null> {
    try {
      const formation = await this.formationRepository.findWithSessions(id);
      if (!formation) {
        throw NotFoundException.resource('Formation', id);
      }
      return formation;
    } catch (error) {
      logger.error(`Error in findWithSessions ${id}:`, error);
      throw error;
    }
  }

  async getRecommended(limit: number = 5): Promise<Formation[]> {
    try {
      return await this.formationRepository.getRecommended(limit);
    } catch (error) {
      logger.error('Error in getRecommended:', error);
      throw error;
    }
  }

  async findFiltered(filters: any, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    try {
      return await this.formationRepository.findFiltered(filters, pagination);
    } catch (error) {
      logger.error('Error in findFiltered:', error);
      throw error;
    }
  }

  async togglePublish(id: string): Promise<Formation> {
    try {
      return await this.formationRepository.togglePublish(id);
    } catch (error) {
      logger.error(`Error in togglePublish ${id}:`, error);
      throw error;
    }
  }

  async updateMetrics(id: string, metrics: any): Promise<Formation> {
    try {
      await this.formationRepository.findByIdOrThrow(id);
      return await this.formationRepository.updateMetrics(id, metrics);
    } catch (error) {
      logger.error(`Error in updateMetrics ${id}:`, error);
      throw error;
    }
  }

  async findBySlugOrThrow(slug: string): Promise<Formation> {
    return await this.formationRepository.findBySlugOrThrow(slug);
  }
}