import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();
const exportController = new ExportController();

// All export routes require admin access
router.use(authMiddleware, isAdmin);

router.get(
  '/registrations/:format',
  exportController.exportRegistrations
);

router.get(
  '/members/:format',
  exportController.exportMembers
);

router.get(
  '/payments/:format',
  exportController.exportPayments
);

router.get(
  '/formations/:format',
  exportController.exportFormations
);

router.get(
  '/projects/:format',
  exportController.exportProjects
);

router.get(
  '/articles/:format',
  exportController.exportArticles
);

export default router;