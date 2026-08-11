import { BaseService } from './base.service';
import { NotificationRepository } from '@repositories/notification.repository';
import { Notification } from '@prisma/client';
import { ApiError } from '@utils/ApiError';
import { logger } from '@config/logger';
import { socketServer } from '@sockets/socket.server';
import { env } from '@config/env';

export class NotificationService extends BaseService<Notification, any, any> {
  private notificationRepository: NotificationRepository;

  constructor() {
    super(new NotificationRepository());
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<Notification> {
    const notification = await this.notificationRepository.create(data);

    // Send real-time notification via socket
    try {
      const io = socketServer.getIO();
      if (io) {
        io.to(`user:${data.userId}`).emit('notification:receive', notification);
      }
    } catch (error) {
      logger.error('Failed to send real-time notification:', error);
    }

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findByIdOrThrow(id);
    return this.notificationRepository.update(id, {
      isRead: true,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUserNotifications(userId: string, params: any): Promise<any> {
    return this.notificationRepository.findPaginated({
      ...params,
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      userId,
      isRead: false,
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async deleteAllUserNotifications(userId: string): Promise<void> {
    await this.notificationRepository.deleteMany({
      where: { userId },
    });
  }

  // System notifications
  async notifyNewRegistration(registration: any): Promise<void> {
    await this.createNotification({
      userId: registration.userId || registration.email,
      type: 'REGISTRATION',
      title: 'Nouvelle inscription',
      message: `Une nouvelle inscription a été enregistrée pour ${registration.formation?.title || 'une formation'}`,
      link: `/admin/registrations/${registration.id}`,
    });
  }

  async notifyPaymentReceived(payment: any): Promise<void> {
    await this.createNotification({
      userId: payment.userId || 'admin',
      type: 'PAYMENT',
      title: 'Paiement reçu',
      message: `Un paiement de ${payment.amount} ${payment.currency} a été reçu`,
      link: `/admin/payments/${payment.id}`,
    });
  }

  async notifyEventCreated(event: any): Promise<void> {
    // Notify all users
    const users = await this.getUserIds();
    for (const userId of users) {
      await this.createNotification({
        userId,
        type: 'EVENT',
        title: 'Nouvel événement',
        message: `Un nouvel événement a été créé: ${event.title}`,
        link: `/events/${event.slug}`,
      });
    }
  }

  async notifyArticlePublished(article: any): Promise<void> {
    // Notify all users
    const users = await this.getUserIds();
    for (const userId of users) {
      await this.createNotification({
        userId,
        type: 'PROMOTION',
        title: 'Nouvel article',
        message: `Un nouvel article a été publié: ${article.title}`,
        link: `/blog/${article.slug}`,
      });
    }
  }

  private async getUserIds(): Promise<string[]> {
    // This would typically get all active user IDs from the database
    // For now, return a placeholder
    return ['admin'];
  }

  toDTO(notification: Notification): any {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}