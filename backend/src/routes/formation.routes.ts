import { Router } from 'express';
import { FormationController } from '../controllers/formation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isEditor, isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createFormationValidator,
  updateFormationValidator,
} from '../validators/formation.validator';

const router = Router();
const formationController = new FormationController();

// Public routes
router.get(
  '/',
  cacheMiddleware(300),
  formationController.getAll
);

router.get(
  '/published',
  cacheMiddleware(300),
  formationController.getPublished
);

router.get(
  '/popular',
  cacheMiddleware(300),
  formationController.getMostPopular
);

router.get(
  '/stats',
  cacheMiddleware(600),
  formationController.getStats
);

router.get(
  '/category/:category',
  cacheMiddleware(300),
  formationController.getByCategory
);

router.get(
  '/level/:level',
  cacheMiddleware(300),
  formationController.getByLevel
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  formationController.getBySlug
);

router.get(
  '/id/:id',
  cacheMiddleware(300),
  formationController.getById
);

router.get(
  '/:id/sessions',
  cacheMiddleware(300),
  formationController.getWithSessions
);

// Admin routes
router.post(
  '/',
  authMiddleware,
  isEditor,
  validate(createFormationValidator),
  formationController.create
);

router.put(
  '/:id',
  authMiddleware,
  isEditor,
  validate(updateFormationValidator),
  formationController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  formationController.delete
);

export default router;