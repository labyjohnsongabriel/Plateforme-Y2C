import { BaseRepository } from './base.repository';
import { Prisma, Notification } from '@prisma/client';

export class NotificationRepository extends BaseRepository<
  Notification,
  Prisma.NotificationWhereInput,
  Prisma.NotificationCreateInput,
  Prisma.NotificationUpdateInput
> {
  constructor() {
    super('notification');
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUnreadCount(userId: string): Promise<number> {
    return this.count({
      userId,
      isRead: false,
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    });
    return result.count || 0;
  }

  async deleteAllByUser(userId: string): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.deleteMany({
        where: { userId },
      });
    });
    return result.count || 0;
  }

  async getStats(): Promise<{
    total: number;
    read: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const [total, read, unread] = await Promise.all([
      this.count(),
      this.count({ isRead: true }),
      this.count({ isRead: false }),
    ]);

    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
      });
    });

    const byType = result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {});

    return { total, read, unread, byType };
  }
}