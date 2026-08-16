import { BaseRepository } from './base.repository';
import { Notification, Prisma } from '@prisma/client';

export class NotificationRepository extends BaseRepository<
  Notification,
  Prisma.NotificationWhereInput,
  Prisma.NotificationCreateInput,
  Prisma.NotificationUpdateInput
> {
  constructor() {
    super('notification');
  }

  async findByUserId(
    userId: string,
    options?: { take?: number; skip?: number }
  ): Promise<Notification[]> {
    const { take = 20, skip = 0 } = options || {};
    return this.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    // Il faut utiliser this.updateMany ou similaire, mais BaseRepository pourrait ne pas avoir updateMany.
    // On peut utiliser this.execute avec une transaction ou utiliser prisma directement.
    // Mais pour simplifier, on peut utiliser prisma directement si on l'importe, mais on veut éviter.
    // Ou on peut ajouter une méthode dans BaseRepository. Sinon, on peut utiliser this.model.updateMany.
    // this.model est le Prisma Model, on peut faire this.model.updateMany.
    const result = await this.model.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ userId, isRead: false });
  }
}