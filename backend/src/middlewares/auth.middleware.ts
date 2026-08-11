import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, getTokenFromHeader, AccessTokenPayload } from '../utils/jwt';
import { logger } from '../config/logger';
import { UnauthorizedException } from '../exceptions';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  (async () => {
    try {
      const token = getTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        throw UnauthorizedException.missingToken();
      }

      const decoded = verifyAccessToken(token);

      if (!decoded) {
        throw UnauthorizedException.invalidToken();
      }

      // Cast du decoded vers AccessTokenPayload
      const payload = decoded as AccessTokenPayload;

      (req as AuthRequest).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName || undefined,
        lastName: payload.lastName || undefined,
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        next(error);
        return;
      }
      logger.error('Auth middleware error:', error);
      next(UnauthorizedException.invalidToken());
    }
  })();
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  (async () => {
    try {
      const token = getTokenFromHeader(req.headers.authorization);
      
      if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
          const payload = decoded as AccessTokenPayload;
          (req as AuthRequest).user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName || undefined,
            lastName: payload.lastName || undefined,
          };
        }
      }

      next();
    } catch (error) {
      next();
    }
  })();
};

export const getUser = (req: Request): AuthRequest['user'] => {
  return (req as AuthRequest).user;
};

export const isAuthenticated = (req: Request): boolean => {
  return !!(req as AuthRequest).user;
};

export const getUserId = (req: Request): string | undefined => {
  return (req as AuthRequest).user?.id;
};