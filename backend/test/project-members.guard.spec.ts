// Unit test — like an xUnit test for a C# authorization handler, mocking the repository
// dependency instead of hitting a real DB.
import { ForbiddenException } from '@nestjs/common';
import { ProjectMembersGuard } from '../src/projects/guards/project-members.guard';

function makeContext(params: any, user: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ params, user }),
    }),
  } as any;
}

describe('ProjectMembersGuard', () => {
  it('allows access when a membership row exists', async () => {
    const membersRepo = { findOne: jest.fn().mockResolvedValue({ id: 'm1' }) } as any;
    const guard = new ProjectMembersGuard(membersRepo);
    const ctx = makeContext({ id: 'project-1' }, { userId: 'user-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(membersRepo.findOne).toHaveBeenCalledWith({
      where: { projectId: 'project-1', userId: 'user-1' },
    });
  });

  it('throws 403 (ForbiddenException) when no membership row exists', async () => {
    const membersRepo = { findOne: jest.fn().mockResolvedValue(null) } as any;
    const guard = new ProjectMembersGuard(membersRepo);
    const ctx = makeContext({ id: 'project-1' }, { userId: 'user-2' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throws 403 when there is no authenticated user', async () => {
    const membersRepo = { findOne: jest.fn() } as any;
    const guard = new ProjectMembersGuard(membersRepo);
    const ctx = makeContext({ id: 'project-1' }, undefined);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
