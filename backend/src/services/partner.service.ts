// backend/src/services/partner.service.ts

import { PartnerRepository } from '../repositories/partner.repository';
import { CreatePartnerDTO, UpdatePartnerDTO } from '../types/dto/partner.dto';
import { ApiError } from '../utils/ApiError';
import { Partner } from '@prisma/client';

export class PartnerService {
  private partnerRepository: PartnerRepository;

  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  // ─── CRUD ──────────────────────────────────────────────
  async findAll(params?: { page?: number; limit?: number }): Promise<{ data: Partner[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.partnerRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.partnerRepository.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Partner> {
    return this.partnerRepository.findByIdOrThrow(id);
  }

  async create(data: CreatePartnerDTO): Promise<Partner> {
    return this.partnerRepository.create(data);
  }

  async update(id: string, data: UpdatePartnerDTO): Promise<Partner> {
    await this.partnerRepository.findByIdOrThrow(id);
    return this.partnerRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.partnerRepository.delete(id);
  }

  // ─── Méthodes spécifiques ──────────────────────────────
  async getActivePartners(): Promise<Partner[]> {
    return this.partnerRepository.findActive();
  }

  async toggleActive(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findByIdOrThrow(id);
    return this.partnerRepository.update(id, {
      isActive: !partner.isActive,
    });
  }

  async getStats() {
    return this.partnerRepository.getStats();
  }

  // ─── DTO ──────────────────────────────────────────────
  toDTO(partner: Partner): any {
    return {
      id: partner.id,
      name: partner.name,
      logo: partner.logo,
      website: partner.website,
      description: partner.description,
      isActive: partner.isActive,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}