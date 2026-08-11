import { Request, Response, NextFunction } from 'express';

// Classe ApiResponse simplifiée
export class ApiResponse<T = any> {
  public readonly success: boolean;
  public readonly data: T;
  public readonly message?: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message);
  }

  static created<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message || 'Resource created successfully');
  }
}

export class AuthController {
  // ===== REGISTER =====
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      
      // Simulation pour le test
      const result = {
        user: { id: 'user-1', email, firstName, lastName, role: 'VIEWER' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      
      res.status(201).json(ApiResponse.created(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ===== LOGIN =====
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Simulation pour le test
      const result = {
        user: { id: 'user-1', email, firstName: 'Admin', lastName: 'User', role: 'SUPER_ADMIN' },
        accessToken: 'mock-access-token-123',
        refreshToken: 'mock-refresh-token-456',
      };
      
      res.status(200).json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  };

  // ===== REFRESH TOKEN =====
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      };
      res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ===== LOGOUT =====
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(ApiResponse.success(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  };

  // ===== GET ME =====
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = {
        id: 'user-1',
        email: 'admin@youthcomputing.mg',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      };
      res.status(200).json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };

  // ===== VERIFY EMAIL =====
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(ApiResponse.success(null, 'Email verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  // ===== FORGOT PASSWORD =====
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(ApiResponse.success(null, 'Password reset link sent to your email'));
    } catch (error) {
      next(error);
    }
  };

  // ===== RESET PASSWORD =====
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(ApiResponse.success(null, 'Password reset successfully'));
    } catch (error) {
      next(error);
    }
  };
}