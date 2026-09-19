// Controller nested under /projects/:projectId/tasks — ProjectMembersGuard runs for every
// route here too, since :projectId is present on every one of them.
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectMembersGuard } from '../projects/guards/project-members.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@UseGuards(JwtAuthGuard, ProjectMembersGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Param('projectId') projectId: string, @Query() query: QueryTasksDto) {
    return this.tasksService.findAll(projectId, query);
  }

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto);
  }

  @Patch(':id')
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(projectId, id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.tasksService.complete(projectId, id);
  }

  @Delete(':id')
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.tasksService.remove(projectId, id);
  }
}
