import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { contactRateLimiter } from '../middlewares/rateLimiter.middleware';
import { createContactMessageValidator, replyContactMessageValidator } from '../validators/contact.validator';

const router = Router();
const contactController = new ContactController();

// Public routes
router.post(
  '/',
  contactRateLimiter,
  validate(createContactMessageValidator),
  contactController.sendMessage
);

// Admin routes
router.get(
  '/',
  authMiddleware,
  isAdmin,
  contactController.getMessages
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  contactController.getStats
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  contactController.getMessage
);

router.post(
  '/:id/reply',
  authMiddleware,
  isAdmin,
  validate(replyContactMessageValidator),
  contactController.replyToMessage
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  contactController.deleteMessage
);

router.patch(
  '/:id/read',
  authMiddleware,
  isAdmin,
  contactController.markAsRead
);

export default router;