import { BaseRepository } from './base.repository';
import { Prisma, Y2CEvent, Y2CEventRegistration } from '@prisma/client';

export class Y2CEventRepository extends BaseRepository<
  Y2CEvent,
  Prisma.Y2CEventWhereInput,
  Prisma.Y2CEventCreateInput,
  Prisma.Y2CEventUpdateInput
> {
  constructor() {
    super('y2cEvent');
  }

  async findBySlug(slug: string): Promise<Y2CEvent | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { slug },
      });
    });
  }

  async findPublished(): Promise<Y2CEvent[]> {
    return this.findMany({
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async findUpcoming(limit: number = 5): Promise<Y2CEvent[]> {
    return this.findMany({
      where: {
        isPublished: true,
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async findByType(eventType: string): Promise<Y2CEvent[]> {
    return this.findMany({
      where: { eventType: eventType as any, isPublished: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    upcoming: number;
    past: number;
    byType: Record<string, number>;
    totalRegistrations: number;
  }> {
    const [total, published, draft, upcoming, past] = await Promise.all([
      this.count(),
      this.count({ isPublished: true }),
      this.count({ isPublished: false }),
      this.count({ startDate: { gt: new Date() }, isPublished: true }),
      this.count({ endDate: { lt: new Date() }, isPublished: true }),
    ]);

    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['eventType'],
        _count: {
          eventType: true,
        },
      });
    });

    const byType = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {});

    // Get registrations count
    const registrationsResult = await this.execute(async () => {
      return await (this.prisma as any).y2cEventRegistration.aggregate({
        _count: {
          id: true,
        },
      });
    });

    return {
      total,
      published,
      draft,
      upcoming,
      past,
      byType,
      totalRegistrations: registrationsResult._count.id || 0,
    };
  }

  async getRegistrations(eventId: string): Promise<Y2CEventRegistration[]> {
    return this.execute(async () => {
      return await (this.prisma as any).y2cEventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async createRegistration(data: any): Promise<Y2CEventRegistration> {
    return this.execute(async () => {
      return await (this.prisma as any).y2cEventRegistration.create({
        data,
      });
    });
  }

  async updateRegistration(id: string, data: any): Promise<Y2CEventRegistration> {
    return this.execute(async () => {
      return await (this.prisma as any).y2cEventRegistration.update({
        where: { id },
        data,
      });
    });
  }

  async getRegistrationStats(eventId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
  }> {
    const [total, pending, confirmed, cancelled, attended] = await Promise.all([
      (this.prisma as any).y2cEventRegistration.count({ where: { eventId } }),
      (this.prisma as any).y2cEventRegistration.count({ where: { eventId, status: 'PENDING' } }),
      (this.prisma as any).y2cEventRegistration.count({ where: { eventId, status: 'CONFIRMED' } }),
      (this.prisma as any).y2cEventRegistration.count({ where: { eventId, status: 'CANCELLED' } }),
      (this.prisma as any).y2cEventRegistration.count({ where: { eventId, attended: true } }),
    ]);

    return { total, pending, confirmed, cancelled, attended };
  }
}