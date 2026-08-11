import { BaseService } from './base.service';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from '../types/dto/user.dto';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { User } from '@prisma/client';
import { Role, UserStatus, ROLE_HIERARCHY } from '../types/roles.enum';

export class UserService extends BaseService<User, CreateUserDTO, UpdateUserDTO> {
  private userRepository: UserRepository;

  constructor() {
    super(new UserRepository());
    this.userRepository = new UserRepository();
  }

  async findAll(pagination?: { page: number; limit: number }): Promise<User[]> {
    if (pagination) {
      const result = await this.userRepository.findPaginated({
        page: pagination.page,
        limit: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });
      return result.data;
    }
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findByIdOrThrow(id);
  }

  async create(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const defaultRole = data.role || Role.VIEWER;

    return this.userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: defaultRole,
      status: data.status || UserStatus.PENDING,
      isActive: true,
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);

    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.userRepository.update(id, updateData);
  }

  async delete(id: string): Promise<User> {
    await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.softDelete(id);
  }

  async hardDelete(id: string): Promise<User> {
    await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async findAdmins(): Promise<User[]> {
    return this.userRepository.findAdmins();
  }

  async searchUsers(search: string): Promise<User[]> {
    return this.userRepository.searchUsers(search);
  }

  async getStats() {
    return this.userRepository.getStats();
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.userRepository.updateLastLogin(id);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByIdOrThrow(id);
    
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    
    await this.userRepository.update(id, {
      password_hash: hashedPassword,
    });
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return this.userRepository.update(id, {
      isActive: !user.isActive,
    });
  }

  async hasRole(id: string, role: Role): Promise<boolean> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return user.role === role;
  }

  async hasMinRole(id: string, minRole: Role): Promise<boolean> {
    const user = await this.userRepository.findByIdOrThrow(id);
    return (ROLE_HIERARCHY[user.role as Role] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
  }

  toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      role: user.role as Role,
      status: user.status as UserStatus,
      isActive: user.isActive,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toDTOs(users: User[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }
}