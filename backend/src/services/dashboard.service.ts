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
import { env } from '../config/env';

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

  // ✅ Méthode getStats (alias de getDashboardData)
  async getStats(): Promise<any> {
    return this.getDashboardData();
  }

  async getDashboardData(): Promise<any> {
    try {
      const [globalStats, realtimeStats, recentActivities, notifications] = await Promise.all([
        this.statsService.getGlobalStats(),
        this.statsService.getRealtimeStats(),
        this.getRecentActivities(10),
        this.getRecentNotifications(),
      ]);
      return {
        stats: globalStats,
        realtime: realtimeStats,
        activities: recentActivities,
        notifications,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return this.activityLogRepository.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getRecentNotifications(limit: number = 10): Promise<any[]> {
    return this.notificationRepository.findMany({
      where: { isRead: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Méthode getNotifications avec userId (filtre par utilisateur)
  async getNotifications(userId: string, limit: number = 10): Promise<any[]> {
    return this.notificationRepository.findMany({
      where: { userId, isRead: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChartData(type: string, period: string): Promise<any> {
    switch (type) {
      case 'registrations':
        return this.getRegistrationChartData(period);
      case 'payments':
        return this.getPaymentChartData(period);
      case 'users':
        return this.getUserChartData(period);
      case 'y2c':
        return this.getY2CChartData(period);
      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }

  private async getRegistrationChartData(period: string): Promise<any> {
    const data = await this.statsService.getMonthlyStats();
    return {
      labels: data.daily.map((d: any) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Inscriptions',
          data: data.daily.map((d: any) => d.newRegistrations),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  private async getPaymentChartData(period: string): Promise<any> {
    const data = await this.statsService.getMonthlyStats();
    return {
      labels: data.daily.map((d: any) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Revenus',
          data: data.daily.map((d: any) => d.revenue),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  private async getUserChartData(period: string): Promise<any> {
    const data = await this.statsService.getMonthlyStats();
    return {
      labels: data.daily.map((d: any) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Nouveaux utilisateurs',
          data: data.daily.map((d: any) => d.newUsers),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  private async getY2CChartData(period: string): Promise<any> {
    const data = await this.statsService.getMonthlyStats();
    return {
      labels: data.daily.map((d: any) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Nouveaux membres Y2C',
          data: data.daily.map((d: any) => d.newY2CMembers),
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
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
      revenue,
    ] = await Promise.all([
      this.userRepository.count(),
      this.formationRepository.count(),
      this.registrationRepository.count(),
      this.y2cMemberRepository.count(),
      this.projectRepository.count(),
      this.articleRepository.count(),
      this.paymentRepository.count(),
      this.paymentRepository.sum('amount', { status: 'PAID' }),
    ]);

    return {
      totalUsers,
      totalFormations,
      totalRegistrations,
      totalY2CMembers,
      totalProjects,
      totalArticles,
      totalPayments,
      revenue: revenue || 0,
    };
  }

  // ✅ Méthode getPerformance (alias de getPerformanceMetrics)
  async getPerformance(): Promise<any> {
    return this.getPerformanceMetrics();
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
      { id: 'widget-1', type: 'stats', title: 'Vue d\'ensemble', size: 'full' },
      { id: 'widget-2', type: 'chart', title: 'Inscriptions', size: 'medium', config: { chartType: 'line', dataType: 'registrations' } },
      { id: 'widget-3', type: 'chart', title: 'Revenus', size: 'medium', config: { chartType: 'bar', dataType: 'payments' } },
      { id: 'widget-4', type: 'list', title: 'Activités récentes', size: 'medium' },
      { id: 'widget-5', type: 'list', title: 'Notifications', size: 'medium' },
    ];
  }
}