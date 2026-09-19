// PATCH DTO — `version` is required so the server can enforce optimistic concurrency
// (client must echo back the version it read; a stale value yields 409, not a silent overwrite).
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsInt()
  version: number;
}
