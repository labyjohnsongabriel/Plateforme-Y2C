import { BaseService } from './base.service';
import { PartnerRepository } from '../repositories/partner.repository';
import { CreatePartnerDTO, UpdatePartnerDTO } from '../types/dto/partner.dto';
import { Partner } from '@prisma/client';

export class PartnerService extends BaseService<Partner, CreatePartnerDTO, UpdatePartnerDTO> {
  private partnerRepository: PartnerRepository;

  constructor() {
    super(new PartnerRepository());
    this.partnerRepository = new PartnerRepository();
  }

  async create(data: CreatePartnerDTO): Promise<Partner> {
    return this.partnerRepository.create({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async update(id: string, data: UpdatePartnerDTO): Promise<Partner> {
    return this.partnerRepository.update(id, data);
  }

  async getActivePartners(): Promise<Partner[]> {
    return this.partnerRepository.findMany({
      where: { isActive: true },
    });
  }

  async toggleActive(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findByIdOrThrow(id);
    return this.partnerRepository.update(id, {
      isActive: !partner.isActive,
    });
  }

  // ✅ AJOUT : Méthode getStats
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const total = await this.partnerRepository.count();
    const active = await this.partnerRepository.count({ isActive: true });
    const inactive = await this.partnerRepository.count({ isActive: false });
    return { total, active, inactive };
  }

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