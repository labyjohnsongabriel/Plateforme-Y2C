// src/repositories/y2cMember.repository.ts
import { BaseRepository } from './base.repository';
import { Prisma, Y2CMember } from '@prisma/client';
import { NotFoundException } from '../exceptions/not-found.exception';

export class Y2CMemberRepository extends BaseRepository<
  Y2CMember,
  Prisma.Y2CMemberWhereInput,
  Prisma.Y2CMemberCreateInput,
  Prisma.Y2CMemberUpdateInput
> {
  constructor() {
    // ✅ Correction : le nom exact du modèle dans le client Prisma
    super('y2CMember'); // ← changement ici
  }

  async findByEmail(email: string): Promise<Y2CMember | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { email },
      });
    });
  }

  async findByBadgeNumber(badgeNumber: string): Promise<Y2CMember | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { badgeNumber },
      });
    });
  }

  async findByEmailOrThrow(email: string): Promise<Y2CMember> {
    const member = await this.findByEmail(email);
    if (!member) {
      throw NotFoundException.resource('Y2CMember', `email: ${email}`);
    }
    return member;
  }

  async findActiveMembers(): Promise<Y2CMember[]> {
    return this.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async findExpiringMembers(daysThreshold: number = 30): Promise<Y2CMember[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return this.findMany({
      where: {
        expiresAt: {
          lte: threshold,
          gt: new Date(),
        },
        status: 'ACTIVE',
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async findExpiredMembers(): Promise<Y2CMember[]> {
    return this.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'ACTIVE',
      },
    });
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    pending: number;
    byInstitution: Record<string, number>;
  }> {
    const [total, active, inactive, expired, pending] = await Promise.all([
      this.count(),
      this.count({ status: 'ACTIVE' }),
      this.count({ status: 'INACTIVE' }),
      this.count({ status: 'EXPIRED' }),
      this.count({ status: 'PENDING' }),
    ]);

    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['institution'],
        _count: {
          institution: true,
        },
      });
    });

    const byInstitution = result.reduce((acc: Record<string, number>, item: any) => {
      if (item.institution) {
        acc[item.institution] = item._count.institution;
      }
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      expired,
      pending,
      byInstitution,
    };
  }

  async searchMembers(search: string): Promise<Y2CMember[]> {
    return this.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
  }

  async countNewMembers(dateFrom: Date): Promise<number> {
    return this.count({
      joinedAt: { gte: dateFrom },
    });
  }
}