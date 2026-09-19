// Feature module for projects — exports ProjectsService and the guard's repo dependency so
// TasksModule (which also needs to check membership) can import it.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectMembersGuard } from './guards/project-members.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  providers: [ProjectsService, ProjectMembersGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectMembersGuard, TypeOrmModule],
})
export class ProjectsModule {}
