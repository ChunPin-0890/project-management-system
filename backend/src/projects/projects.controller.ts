// Controller for /projects. List/create need only auth (membership is the list filter itself);
// get/update/delete on a specific :id also run ProjectMembersGuard to enforce per-project access.
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectMembersGuard } from './guards/project-members.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.projectsService.findAllForUser(user.userId);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: { userId: string }) {
    return this.projectsService.create(dto, user.userId);
  }

  @UseGuards(ProjectMembersGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(ProjectMembersGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @UseGuards(ProjectMembersGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
