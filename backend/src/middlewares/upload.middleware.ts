import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

// ─── Constantes ─────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const MAX_FILES = 5;

// ─── Création des dossiers ────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const AVATAR_UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars');

[UPLOAD_DIR, AVATAR_UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`✅ Dossier créé : ${dir}`);
  }
});

// ─── Configuration du stockage pour les fichiers généraux ──
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── Configuration du stockage pour les avatars ────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// ─── Filtres par type de fichier ───────────────────────────
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Format non autorisé. Utilisez : ${ALLOWED_IMAGE_TYPES.join(', ')}`) as any);
  }
};

const avatarFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Format non autorisé pour l'avatar. Utilisez : ${ALLOWED_IMAGE_TYPES.join(', ')}`) as any);
  }
};

// ─── Instances Multer ──────────────────────────────────────
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFilter,
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: avatarFilter,
});

// ─── Middlewares exportés ──────────────────────────────────
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `Fichier trop volumineux. Max : ${MAX_FILE_SIZE / 1024 / 1024} Mo`));
          } else {
            next(new ApiError(400, `Erreur d’upload : ${err.message}`));
          }
        } else {
          next(err);
        }
      } else {
        next();
      }
    });
  };
};

export const uploadMultiple = (fieldName: string, maxCount: number = MAX_FILES) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `Fichier trop volumineux. Max : ${MAX_FILE_SIZE / 1024 / 1024} Mo`));
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            next(new ApiError(400, `Trop de fichiers. Max : ${maxCount}`));
          } else {
            next(new ApiError(400, `Erreur d’upload : ${err.message}`));
          }
        } else {
          next(err);
        }
      } else {
        next();
      }
    });
  };
};

// ✅ Export explicite de uploadAvatar (utilisé dans user.routes.ts)
export { uploadAvatar };

// ─── Helper pour l'URL absolue ─────────────────────────────
export const getFileUrl = (req: Request, filename: string): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// ─── Gestion d'erreur globale (optionnelle) ───────────────
export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApiError) {
    next(err);
  } else if (err instanceof multer.MulterError) {
    next(new ApiError(400, `Erreur d’upload : ${err.message}`));
  } else {
    next(new ApiError(500, 'Échec de l’upload'));
  }
};