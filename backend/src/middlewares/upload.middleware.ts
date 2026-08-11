import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} not allowed`) as any);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // ✅ Correction : utiliser les bons codes Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`));
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            next(new ApiError(400, `Too many files. Max: ${MAX_FILES}`));
          } else {
            next(new ApiError(400, `Upload error: ${err.message}`));
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

export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // ✅ Correction : utiliser les bons codes Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`));
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            next(new ApiError(400, `Too many files. Max: ${maxCount}`));
          } else {
            next(new ApiError(400, `Upload error: ${err.message}`));
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

export const uploadFields = (fields: Array<{ name: string; maxCount: number }>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // ✅ Correction : utiliser les bons codes Multer
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`));
          } else {
            next(new ApiError(400, `Upload error: ${err.message}`));
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

export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApiError) {
    next(err);
  } else if (err instanceof multer.MulterError) {
    next(new ApiError(400, `Upload error: ${err.message}`));
  } else {
    // ✅ Correction : utiliser new ApiError au lieu de ApiError.internalServer
    next(new ApiError(500, 'Upload failed'));
  }
};

export const generateFileName = (originalName: string): string => {
  const extension = path.extname(originalName);
  return `${uuidv4()}${extension}`;
};

export const getFileUrl = (req: Request, filename: string): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};