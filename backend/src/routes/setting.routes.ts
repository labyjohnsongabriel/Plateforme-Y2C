import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();
const settingController = new SettingController();

// ─── Routes publiques ──────────────────────────────────────────
router.get('/public', settingController.getPublic);

// ─── Routes protégées (admin uniquement) ──────────────────────
router.use(authMiddleware, isAdmin);

router.get('/', settingController.getAll);
router.get('/group/:group', settingController.getGroup);
router.get('/:key', settingController.getByKey);
router.put('/group/:group', settingController.updateGroup);
router.patch('/:key', settingController.updateSingle);
router.post('/reset', settingController.reset);

export default router;