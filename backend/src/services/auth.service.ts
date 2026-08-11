import { UserRepository } from '@repositories/user.repository';
import { RefreshTokenRepository } from '@repositories/refreshToken.repository';
import { ActivityLogRepository } from '@repositories/activityLog.repository';
import { ApiError } from '@utils/ApiError';
import { hashPassword, comparePasswords } from '@utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '@utils/jwt';
import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import { env } from '@config/env';
import { RegisterDTO, LoginDTO } from '@types/dto/auth.dto';
import { User } from '@prisma/client';
import { Role } from '@types/roles.enum';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private activityLogRepository: ActivityLogRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.activityLogRepository = new ActivityLogRepository();
  }

  async register(data: RegisterDTO): Promise<{
    user: Omit<User, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: Role.VIEWER,
      status: 'PENDING',
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send welcome email
    try {
      await mailer.sendTemplatedEmail(user.email, 'welcome', {
        name: `${user.firstName} ${user.lastName}`,
        content: `
          <p>Bienvenue sur la plateforme Youth Computing !</p>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>Pour commencer, veuillez vérifier votre adresse email.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    // Log activity
    await this.activityLogRepository.create({
      userId: user.id,
      action: 'REGISTER',
      resource: 'user',
      resourceId: user.id,
      metadata: { email: user.email },
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string, ipAddress: string, userAgent?: string): Promise<{
    user: Omit<User, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('Account is disabled');
    }

    if (user.status === 'SUSPENDED') {
      throw ApiError.unauthorized('Account suspended');
    }

    // Check password
    const isValid = await comparePasswords(password, user.password_hash);
    if (!isValid) {
      // Log failed attempt
      await this.activityLogRepository.create({
        userId: user.id,
        action: 'LOGIN',
        resource: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { success: false, reason: 'Invalid password' },
      });
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Log successful login
    await this.activityLogRepository.create({
      userId: user.id,
      action: 'LOGIN',
      resource: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: { success: true },
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Check if token exists in database
    const storedToken = await this.refreshTokenRepository.findValidToken(token, decoded.userId);
    if (!storedToken) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.refreshTokenRepository.revokeToken(storedToken.id);

    // Get user
    const user = await this.userRepository.findByIdOrThrow(decoded.userId);
    if (!user.isActive) {
      throw ApiError.unauthorized('User not active');
    }

    // Generate new tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store new refresh token
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await this.refreshTokenRepository.revokeAllUserTokens(userId);

    // Log logout
    await this.activityLogRepository.create({
      userId,
      action: 'LOGOUT',
      resource: 'user',
      resourceId: userId,
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findByIdOrThrow(userId);
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyEmail(token: string): Promise<void> {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw ApiError.badRequest('Invalid verification token');
    }

    const user = await this.userRepository.findByIdOrThrow(decoded.userId);
    if (user.status !== 'PENDING') {
      throw ApiError.badRequest('Email already verified');
    }

    await this.userRepository.update(user.id, {
      status: 'ACTIVE',
      emailVerified: new Date(),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const resetToken = generateAccessToken(payload);

    // Send reset email
    try {
      await mailer.sendTemplatedEmail(user.email, 'reset-password', {
        name: `${user.firstName} ${user.lastName}`,
        content: `
          <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p>
            <a href="${env.FRONTEND_URL}/reset-password?token=${resetToken}">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien expire dans 15 minutes.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send reset password email:', error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.userRepository.update(decoded.userId, {
      password_hash: hashedPassword,
    });

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.revokeAllUserTokens(decoded.userId);
  }
}