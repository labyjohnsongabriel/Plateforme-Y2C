import { Router } from 'express';
import { Y2CController } from '../controllers/y2c.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createY2CMemberValidator,
  updateY2CMemberValidator,
  createY2CEventValidator,
  updateY2CEventValidator,
} from '../validators/y2c.validator';

const router = Router();
const y2cController = new Y2CController();

// ============ MEMBERS ============
// Public routes
router.post(
  '/members',
  validate(createY2CMemberValidator),
  y2cController.createMember
);

// Admin routes
router.get(
  '/members',
  authMiddleware,
  isAdmin,
  y2cController.getMembers
);

router.get(
  '/members/stats',
  authMiddleware,
  isAdmin,
  y2cController.getMemberStats
);

router.get(
  '/members/:id',
  authMiddleware,
  isAdmin,
  y2cController.getMember
);

router.put(
  '/members/:id',
  authMiddleware,
  isAdmin,
  validate(updateY2CMemberValidator),
  y2cController.updateMember
);

router.delete(
  '/members/:id',
  authMiddleware,
  isAdmin,
  y2cController.deleteMember
);

router.patch(
  '/members/:id/approve',
  authMiddleware,
  isAdmin,
  y2cController.approveMember
);

// ============ EVENTS ============
// Public routes
router.get(
  '/events',
  y2cController.getEvents
);

router.get(
  '/events/:id',
  y2cController.getEvent
);

router.post(
  '/events/:id/register',
  y2cController.registerForEvent
);

// Admin routes
router.post(
  '/events',
  authMiddleware,
  isAdmin,
  validate(createY2CEventValidator),
  y2cController.createEvent
);

router.put(
  '/events/:id',
  authMiddleware,
  isAdmin,
  validate(updateY2CEventValidator),
  y2cController.updateEvent
);

router.delete(
  '/events/:id',
  authMiddleware,
  isAdmin,
  y2cController.deleteEvent
);

router.get(
  '/events/stats',
  authMiddleware,
  isAdmin,
  y2cController.getEventStats
);

router.get(
  '/events/:id/registrations',
  authMiddleware,
  isAdmin,
  y2cController.getEventRegistrations
);

export default router;