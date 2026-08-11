import { BaseRepository } from './base.repository';
import { Prisma, Partner } from '@prisma/client';

export class PartnerRepository extends BaseRepository<
  Partner,
  Prisma.PartnerWhereInput,
  Prisma.PartnerCreateInput,
  Prisma.PartnerUpdateInput
> {
  constructor() {
    super('partner');
  }

  async findActive(): Promise<Partner[]> {
    return this.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchPartners(search: string): Promise<Partner[]> {
    return this.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);

    return { total, active, inactive };
  }
}