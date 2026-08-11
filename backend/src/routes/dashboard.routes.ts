import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require admin access
router.use(authMiddleware, isAdmin);

router.get(
  '/stats',
  cacheMiddleware(60),
  dashboardController.getStats
);

router.get(
  '/quick-stats',
  cacheMiddleware(60),
  dashboardController.getQuickStats
);

router.get(
  '/chart',
  cacheMiddleware(60),
  dashboardController.getChartData
);

router.get(
  '/activities',
  cacheMiddleware(60),
  dashboardController.getRecentActivities
);

router.get(
  '/notifications',
  cacheMiddleware(60),
  dashboardController.getNotifications
);

router.get(
  '/performance',
  cacheMiddleware(60),
  dashboardController.getPerformance
);

router.get(
  '/widgets',
  cacheMiddleware(60),
  dashboardController.getWidgets
);

export default router;