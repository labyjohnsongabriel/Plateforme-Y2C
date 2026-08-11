import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createUserValidator,
  updateUserValidator,
  changePasswordValidator,
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// Admin routes
router.get(
  '/',
  authMiddleware,
  isAdmin,
  userController.getAll as RequestHandler
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  userController.getStats as RequestHandler
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  userController.getById as RequestHandler
);

router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate(createUserValidator),
  userController.create as RequestHandler
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updateUserValidator),
  userController.update as RequestHandler
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  userController.delete as RequestHandler
);

router.patch(
  '/:id/toggle-active',
  authMiddleware,
  isAdmin,
  userController.toggleActive as RequestHandler
);

// User profile routes (authenticated)
router.get(
  '/profile',
  authMiddleware,
  userController.getProfile as RequestHandler
);

router.put(
  '/profile',
  authMiddleware,
  validate(updateUserValidator),
  userController.updateProfile as RequestHandler
);

router.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordValidator),
  userController.changePassword as RequestHandler
);

export default router;