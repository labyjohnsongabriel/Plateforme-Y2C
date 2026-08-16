// backend/src/services/dashboard.service.ts

import { StatsService } from './stats.service';
import { UserRepository } from '../repositories/user.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { ActivityLogRepository } from '../repositories/activityLog.repository';
import { FormationRepository } from '../repositories/formation.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ArticleRepository } from '../repositories/article.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { logger } from '../config/logger';
import prisma from '../../prisma/client';
import {
  PaymentStatus,
  RegistrationStatus,
  ProjectStatus,
  ArticleStatus,
  Y2CMemberStatus,
} from '@prisma/client';

export class DashboardService {
  private statsService: StatsService;
  private userRepository: UserRepository;
  private notificationRepository: NotificationRepository;
  private activityLogRepository: ActivityLogRepository;
  private formationRepository: FormationRepository;
  private registrationRepository: RegistrationRepository;
  private y2cMemberRepository: Y2CMemberRepository;
  private projectRepository: ProjectRepository;
  private articleRepository: ArticleRepository;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.statsService = new StatsService();
    this.userRepository = new UserRepository();
    this.notificationRepository = new NotificationRepository();
    this.activityLogRepository = new ActivityLogRepository();
    this.formationRepository = new FormationRepository();
    this.registrationRepository = new RegistrationRepository();
    this.y2cMemberRepository = new Y2CMemberRepository();
    this.projectRepository = new ProjectRepository();
    this.articleRepository = new ArticleRepository();
    this.paymentRepository = new PaymentRepository();
  }

  /**
   * ⚡ Récupère toutes les données du tableau de bord
   */
  async getDashboardData(): Promise<any> {
    const start = Date.now();
    try {
      const [
        totalUsers,
        activeUsers,
        totalFormations,
        publishedFormations,
        totalRegistrations,
        confirmedRegistrations,
        totalY2CMembers,
        activeY2CMembers,
        totalProjects,
        completedProjects,
        totalPayments,
        successPayments,
        totalArticles,
        publishedArticles,
        unreadMessages,
      ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.formation.count(),
        prisma.formation.count({ where: { isPublished: true } }),
        prisma.registration.count(),
        prisma.registration.count({ where: { status: RegistrationStatus.CONFIRMED } }),
        prisma.y2CMember.count(),
        prisma.y2CMember.count({ where: { status: Y2CMemberStatus.ACTIVE } }),
        prisma.project.count(),
        prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
        prisma.article.count(),
        prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
        prisma.contactMessage.count({ where: { isRead: false } }),
      ]);

      // ✅ Activités récentes – relation "User" (majuscule)
      const recentActivities = await this.activityLogRepository.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Notifications
      const notifications = await this.notificationRepository.findMany({
        where: { isRead: false },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          message: true,
          link: true,
          createdAt: true,
          isRead: true,
        },
      });

      logger.debug(`📊 Dashboard data fetched in ${Date.now() - start}ms`);

      return {
        stats: {
          users: { total: totalUsers, active: activeUsers },
          formations: { total: totalFormations, published: publishedFormations },
          registrations: { total: totalRegistrations, confirmed: confirmedRegistrations },
          y2c: { total: totalY2CMembers, active: activeY2CMembers },
          projects: { total: totalProjects, completed: completedProjects },
          payments: { total: totalPayments, success: successPayments },
          articles: { total: totalArticles, published: publishedArticles },
          contact: { unread: unreadMessages },
        },
        realtime: {
          activeUsers: 42,
          requestsPerMinute: 120,
          responseTime: 150,
          timestamp: new Date(),
        },
        activities: recentActivities,
        notifications,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('❌ Failed to get dashboard data:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return this.activityLogRepository.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async getNotifications(userId?: string, limit: number = 10): Promise<any[]> {
    const where: any = { isRead: false };
    if (userId) where.userId = userId;
    return this.notificationRepository.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        link: true,
        createdAt: true,
        isRead: true,
      },
    });
  }

  async getChartData(type: string, period: string): Promise<any> {
    const monthlyData = await this.statsService.getMonthlyStats();
    const labels = monthlyData.daily.map((d: any) => new Date(d.date).toLocaleDateString());

    const datasets: Record<string, any[]> = {
      registrations: monthlyData.daily.map((d: any) => d.newRegistrations),
      payments: monthlyData.daily.map((d: any) => d.revenue),
      users: monthlyData.daily.map((d: any) => d.newUsers),
      y2c: monthlyData.daily.map((d: any) => d.newY2CMembers),
    };

    const colors: Record<string, any> = {
      registrations: { bg: 'rgba(54, 162, 235, 0.5)', border: 'rgba(54, 162, 235, 1)' },
      payments: { bg: 'rgba(75, 192, 192, 0.5)', border: 'rgba(75, 192, 192, 1)' },
      users: { bg: 'rgba(255, 99, 132, 0.5)', border: 'rgba(255, 99, 132, 1)' },
      y2c: { bg: 'rgba(255, 159, 64, 0.5)', border: 'rgba(255, 159, 64, 1)' },
    };

    if (!datasets[type]) throw new Error(`Unknown chart type: ${type}`);

    return {
      labels,
      datasets: [
        {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data: datasets[type],
          backgroundColor: colors[type]?.bg || 'rgba(0,0,0,0.2)',
          borderColor: colors[type]?.border || 'rgba(0,0,0,0.8)',
          borderWidth: 1,
        },
      ],
    };
  }

  async getQuickStats(): Promise<any> {
    const [
      totalUsers,
      totalFormations,
      totalRegistrations,
      totalY2CMembers,
      totalProjects,
      totalArticles,
      totalPayments,
      revenueAggregate,
    ] = await Promise.all([
      this.userRepository.count(),
      this.formationRepository.count(),
      this.registrationRepository.count(),
      this.y2cMemberRepository.count(),
      this.projectRepository.count(),
      this.articleRepository.count(),
      this.paymentRepository.count(),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalFormations,
      totalRegistrations,
      totalY2CMembers,
      totalProjects,
      totalArticles,
      totalPayments,
      revenue: revenueAggregate._sum?.amount ?? 0,
    };
  }

  async getPerformanceMetrics(): Promise<any> {
    return {
      responseTime: 150,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: 20,
      activeUsers: 42,
      requestsPerMinute: 120,
      errorRate: 0.5,
      timestamp: new Date(),
    };
  }

  async getWidgets(): Promise<any[]> {
    return [
      { id: 'widget-1', type: 'stats', title: "Vue d'ensemble", size: 'full' },
      {
        id: 'widget-2',
        type: 'chart',
        title: 'Inscriptions',
        size: 'medium',
        config: { chartType: 'line', dataType: 'registrations' },
      },
      {
        id: 'widget-3',
        type: 'chart',
        title: 'Revenus',
        size: 'medium',
        config: { chartType: 'bar', dataType: 'payments' },
      },
      { id: 'widget-4', type: 'list', title: 'Activités récentes', size: 'medium' },
      { id: 'widget-5', type: 'list', title: 'Notifications', size: 'medium' },
    ];
  }

  async getStats(): Promise<any> {
    return this.getDashboardData();
  }
}