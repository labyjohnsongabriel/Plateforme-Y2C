// backend/src/routes/notification.routes.ts

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes
router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);
router.get('/unread-count', notificationController.getUnreadCount);

export default router;