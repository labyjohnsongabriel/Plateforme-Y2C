import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { createPartnerValidator, updatePartnerValidator } from '../validators/partner.validator';

const router = Router();
const partnerController = new PartnerController();

// Public routes
router.get(
  '/',
  cacheMiddleware(300),
  partnerController.getAll
);

router.get(
  '/active',
  cacheMiddleware(300),
  partnerController.getActive
);

router.get(
  '/:id',
  cacheMiddleware(300),
  partnerController.getById
);

// Admin routes
router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate(createPartnerValidator),
  partnerController.create
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updatePartnerValidator),
  partnerController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  partnerController.delete
);

router.patch(
  '/:id/toggle-active',
  authMiddleware,
  isAdmin,
  partnerController.toggleActive
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  partnerController.getStats
);

export default router;