// backend/src/routes/upload.routes.ts
import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware';

const router = Router();
const uploadController = new UploadController();

// Toutes les routes d’upload nécessitent une authentification
router.use(authMiddleware);

router.post('/single', uploadSingle('file'), uploadController.uploadSingle);
router.post('/multiple', uploadMultiple('files', 5), uploadController.uploadMultiple);
router.delete('/:id', uploadController.deleteFile);
router.get('/', uploadController.getFiles);
router.get('/:id', uploadController.getFile);

export default router;