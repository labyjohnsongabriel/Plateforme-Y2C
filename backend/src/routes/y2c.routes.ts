// src/routes/y2c.routes.ts

import { Router } from 'express';
import { Y2CController } from '../controllers/y2c.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin, isSuperAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createY2CMemberValidator,
  updateY2CMemberValidator,
  createY2CEventValidator,
  updateY2CEventValidator,
} from '../validators/y2c.validator';

const router = Router();
const y2cController = new Y2CController();

// ═══════════════════════════════════════════════════════════════
// 1. MEMBRES – Routes publiques (inscription, etc.)
// ═══════════════════════════════════════════════════════════════
router.post(
  '/members',
  validate(createY2CMemberValidator),
  y2cController.createMember
);

// ═══════════════════════════════════════════════════════════════
// 2. MEMBRES – Routes administrateur (authentification requise)
// ═══════════════════════════════════════════════════════════════
router.get(
  '/members',
  authenticate,
  isAdmin,
  y2cController.getMembers
);

router.get(
  '/members/stats',
  authenticate,
  isAdmin,
  y2cController.getMemberStats
);

router.get(
  '/members/:id',
  authenticate,
  isAdmin,
  y2cController.getMember
);

router.put(
  '/members/:id',
  authenticate,
  isAdmin,
  validate(updateY2CMemberValidator),
  y2cController.updateMember
);

router.delete(
  '/members/:id',
  authenticate,
  isAdmin,
  y2cController.deleteMember
);

router.patch(
  '/members/:id/approve',
  authenticate,
  isAdmin,
  y2cController.approveMember
);

// ═══════════════════════════════════════════════════════════════
// 3. BADGES – Génération (admin uniquement)
// ═══════════════════════════════════════════════════════════════
router.post(
  '/members/:id/generate-badge',
  authenticate,
  isAdmin,
  y2cController.generateBadgeForMember
);

router.post(
  '/members/generate-badges',
  authenticate,
  isAdmin,
  y2cController.generateBadges
);

// ═══════════════════════════════════════════════════════════════
// 4. ÉVÉNEMENTS – Routes publiques
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 5. ÉVÉNEMENTS – Routes administrateur
// ═══════════════════════════════════════════════════════════════
router.post(
  '/events',
  authenticate,
  isAdmin,
  validate(createY2CEventValidator),
  y2cController.createEvent
);

router.put(
  '/events/:id',
  authenticate,
  isAdmin,
  validate(updateY2CEventValidator),
  y2cController.updateEvent
);

router.delete(
  '/events/:id',
  authenticate,
  isAdmin,
  y2cController.deleteEvent
);

router.get(
  '/events/stats',
  authenticate,
  isAdmin,
  y2cController.getEventStats
);

router.get(
  '/events/:id/registrations',
  authenticate,
  isAdmin,
  y2cController.getEventRegistrations
);

export default router;