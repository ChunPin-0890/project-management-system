// Authorization guard — like an ASP.NET Core resource-based [Authorize] handler: runs after
// JwtAuthGuard, re-checks membership by querying project_members directly by the route's
// project id and the authenticated user's id (never trusting any client-supplied claim of
// membership). Non-members get 403, not 404, per spec — the project's existence isn't hidden,
// only its contents are.
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../entities/project-member.entity';

@Injectable()
export class ProjectMembersGuard implements CanActivate {
  constructor(
    @InjectRepository(ProjectMember) private readonly membersRepo: Repository<ProjectMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const projectId: string = request.params.id || request.params.projectId;
    const userId: string = request.user?.userId;

    if (!projectId || !userId) {
      throw new ForbiddenException('Not a member of this project');
    }

    const membership = await this.membersRepo.findOne({ where: { projectId, userId } });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }
    return true;
  }
}
