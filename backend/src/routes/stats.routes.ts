import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();
const statsController = new StatsController();

// All stats routes require admin access
router.use(authMiddleware, isAdmin);

router.get(
  '/global',
  cacheMiddleware(300),
  statsController.getGlobalStats
);

router.get(
  '/daily',
  cacheMiddleware(300),
  statsController.getDailyStats
);

router.get(
  '/monthly',
  cacheMiddleware(300),
  statsController.getMonthlyStats
);

router.get(
  '/yearly',
  cacheMiddleware(300),
  statsController.getYearlyStats
);

router.get(
  '/realtime',
  cacheMiddleware(30),
  statsController.getRealtimeStats
);

export default router;