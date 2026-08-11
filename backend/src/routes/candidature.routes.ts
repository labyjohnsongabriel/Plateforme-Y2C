import { Router } from 'express';
import { CandidatureController } from '../controllers/candidature.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createCandidatureValidator,
  updateCandidatureValidator,
  createInterviewValidator,
  createEvaluationValidator,
} from '../validators/candidature.validator';

const router = Router();
const candidatureController = new CandidatureController();

// Admin routes
router.get(
  '/',
  authMiddleware,
  isAdmin,
  candidatureController.getAll
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  candidatureController.getStats
);

router.get(
  '/recruitment/:recruitmentId',
  authMiddleware,
  isAdmin,
  candidatureController.getByRecruitment
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  candidatureController.getById
);

router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate(createCandidatureValidator),
  candidatureController.create
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updateCandidatureValidator),
  candidatureController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  candidatureController.delete
);

// Interview routes
router.post(
  '/:id/interviews',
  authMiddleware,
  isAdmin,
  validate(createInterviewValidator),
  candidatureController.scheduleInterview
);

router.put(
  '/interviews/:id',
  authMiddleware,
  isAdmin,
  candidatureController.updateInterview
);

router.get(
  '/:id/interviews',
  authMiddleware,
  isAdmin,
  candidatureController.getInterviews
);

// Evaluation routes
router.post(
  '/:id/evaluations',
  authMiddleware,
  isAdmin,
  validate(createEvaluationValidator),
  candidatureController.addEvaluation
);

router.get(
  '/:id/evaluations',
  authMiddleware,
  isAdmin,
  candidatureController.getEvaluations
);

router.get(
  '/:id/score',
  authMiddleware,
  isAdmin,
  candidatureController.getAverageScore
);

export default router;