// backend/src/services/notification.service.ts

import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '@prisma/client';
import { CreateNotificationDTO } from '../types/dto/notification.dto';
import { ApiError } from '../utils/ApiError';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  /**
   * Récupère les notifications d'un utilisateur avec pagination
   */
  async getByUser(userId: string, pagination?: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = pagination || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationRepository.findByUserId(userId, { take: limit, skip }),
      this.notificationRepository.countUnread(userId),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Marque une notification comme lue (vérifie les droits)
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw ApiError.notFound('Notification introuvable');
    }
    if (notification.userId !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette notification');
    }
    return this.notificationRepository.markAsRead(id);
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnread(userId);
    return { count };
  }

  /**
   * Crée une notification
   */
  async create(data: CreateNotificationDTO): Promise<Notification> {
    return this.notificationRepository.create(data);
  }
}