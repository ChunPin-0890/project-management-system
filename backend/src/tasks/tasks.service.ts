// Service for tasks: filtering/pagination with a stable sort, and optimistic concurrency on
// update — the raw-SQL/TypeORM analogue of EF Core catching DbUpdateConcurrencyException.
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasksRepo: Repository<Task>) {}

  async findAll(projectId: string, query: QueryTasksDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.tasksRepo.createQueryBuilder('task').where('task.project_id = :projectId', { projectId });

    if (query.status) qb.andWhere('task.status = :status', { status: query.status });
    if (query.assigneeId) qb.andWhere('task.assignee_id = :assigneeId', { assigneeId: query.assigneeId });
    if (query.dueDateFrom) qb.andWhere('task.due_date >= :from', { from: query.dueDateFrom });
    if (query.dueDateTo) qb.andWhere('task.due_date <= :to', { to: query.dueDateTo });

    // Stable sort: primary key by due_date (nulls last), tiebreaker on id so pagination never
    // reshuffles rows between pages — same idea as ORDER BY DueDate, Id in a SQL Server query.
    qb.orderBy('task.due_date', 'ASC', 'NULLS LAST').addOrderBy('task.id', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async create(projectId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepo.create({
      title: dto.title,
      projectId,
      status: dto.status ?? TaskStatus.TODO,
      assigneeId: dto.assigneeId ?? null,
      dueDate: dto.dueDate ?? null,
    });
    return this.tasksRepo.save(task);
  }

  private async findOneInProject(projectId: string, id: string): Promise<Task> {
    const task = await this.tasksRepo.findOne({ where: { id, projectId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(projectId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOneInProject(projectId, id);

    if (task.version !== dto.version) {
      throw new ConflictException(
        'This task was updated by someone else. Reload to see the latest version before retrying.',
      );
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.assigneeId !== undefined) task.assigneeId = dto.assigneeId;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;
    task.version += 1;

    return this.tasksRepo.save(task);
  }

  async complete(projectId: string, id: string): Promise<Task> {
    const task = await this.findOneInProject(projectId, id);
    task.status = TaskStatus.COMPLETED;
    task.version += 1;
    return this.tasksRepo.save(task);
  }

  async remove(projectId: string, id: string): Promise<void> {
    await this.findOneInProject(projectId, id);
    await this.tasksRepo.delete({ id, projectId });
  }
}
