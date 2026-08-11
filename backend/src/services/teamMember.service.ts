import { BaseService } from './base.service';
import { TeamMemberRepository } from '../repositories/teamMember.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTeamMemberDTO, UpdateTeamMemberDTO } from '../types/dto/team-member.dto';
import { ApiError } from '../utils/ApiError';
import { TeamMember } from '@prisma/client';

export class TeamMemberService extends BaseService<TeamMember, CreateTeamMemberDTO, UpdateTeamMemberDTO> {
  private teamMemberRepository: TeamMemberRepository;
  private userRepository: UserRepository;

  constructor() {
    super(new TeamMemberRepository());
    this.teamMemberRepository = new TeamMemberRepository();
    this.userRepository = new UserRepository();
  }

  async create(data: CreateTeamMemberDTO): Promise<TeamMember> {
    const user = await this.userRepository.findByIdOrThrow(data.userId);
    const existing = await this.teamMemberRepository.findByUserId(data.userId);
    if (existing) {
      throw ApiError.conflict('User is already a team member');
    }
    const displayOrder = data.displayOrder || 0;
    // ✅ Utilisation de la relation Prisma
    return this.teamMemberRepository.create({
      ...data,
      displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : true,
      user: {
        connect: { id: data.userId }
      }
    });
  }

  async update(id: string, data: UpdateTeamMemberDTO): Promise<TeamMember> {
    return this.teamMemberRepository.update(id, data);
  }

  async getActiveMembers(): Promise<TeamMember[]> {
    return this.teamMemberRepository.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getByDepartment(department: string): Promise<TeamMember[]> {
    return this.teamMemberRepository.findMany({
      where: { department, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async reorder(memberIds: string[]): Promise<void> {
    for (let i = 0; i < memberIds.length; i++) {
      await this.teamMemberRepository.update(memberIds[i], {
        displayOrder: i,
      });
    }
  }

  async toggleActive(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findByIdOrThrow(id);
    return this.teamMemberRepository.update(id, {
      isActive: !member.isActive,
    });
  }

  async getStats(): Promise<any> {
    const total = await this.teamMemberRepository.count();
    const active = await this.teamMemberRepository.count({ isActive: true });
    const inactive = await this.teamMemberRepository.count({ isActive: false });
    const byDepartment = await this.teamMemberRepository.groupBy('department');
    return { total, active, inactive, byDepartment };
  }

  toDTO(member: TeamMember & { user?: any }): any {
    return {
      id: member.id,
      userId: member.userId,
      user: member.user ? {
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        fullName: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        avatar: member.user.avatar,
      } : undefined,
      role: member.role,
      department: member.department,
      bio: member.bio,
      photoUrl: member.photoUrl,
      linkedin: member.linkedin,
      displayOrder: member.displayOrder,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}