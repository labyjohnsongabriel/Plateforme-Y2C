import { BaseRepository } from './base.repository';
import { Prisma, TeamMember } from '@prisma/client';

export class TeamMemberRepository extends BaseRepository<
  TeamMember,
  Prisma.TeamMemberWhereInput,
  Prisma.TeamMemberCreateInput,
  Prisma.TeamMemberUpdateInput
> {
  constructor() {
    super('teamMember');
  }

  async findByUserId(userId: string): Promise<TeamMember | null> {
    return this.findFirst({ userId });
  }

  async groupBy(field: string): Promise<Record<string, number>> {
    const result = await this.execute(async () => {
      return await this.model.groupBy({
        by: [field],
        _count: {
          [field]: true,
        },
      });
    });
    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item[field]] = item._count[field];
      return acc;
    }, {});
  }
}