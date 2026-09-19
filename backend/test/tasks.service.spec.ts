// Unit tests for TasksService — mocked repo, focused on the optimistic-concurrency behavior
// and the create defaults, the same style as mocking DbSet<T> in an EF Core unit test.
import { ConflictException } from '@nestjs/common';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskStatus } from '../src/tasks/entities/task.entity';

describe('TasksService', () => {
  function makeService(taskOverrides: Partial<any> = {}) {
    const task = {
      id: 't1',
      title: 'Original',
      projectId: 'p1',
      status: TaskStatus.TODO,
      assigneeId: null,
      dueDate: null,
      version: 1,
      ...taskOverrides,
    };
    const repo = {
      findOne: jest.fn().mockResolvedValue(task),
      save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
      create: jest.fn().mockImplementation((t) => t),
    } as any;
    return { service: new TasksService(repo), repo, task };
  }

  it('updates and increments version when the client version matches', async () => {
    const { service, task } = makeService();
    const result = await service.update('p1', 't1', { title: 'Updated', version: 1 } as any);
    expect(result.title).toBe('Updated');
    expect(result.version).toBe(2);
  });

  it('throws ConflictException (409) when the client version is stale', async () => {
    const { service } = makeService({ version: 3 });
    await expect(service.update('p1', 't1', { title: 'Updated', version: 1 } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('marks a task complete and bumps its version', async () => {
    const { service } = makeService();
    const result = await service.complete('p1', 't1');
    expect(result.status).toBe(TaskStatus.COMPLETED);
    expect(result.version).toBe(2);
  });
});
