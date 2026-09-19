// Service layer for projects. findAllForUser uses a correlated subquery for the task count
// (avoids N+1 queries — the SQL equivalent of an EF Core .Select(p => new { ..., TaskCount =
// p.Tasks.Count() }) projection).
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectMember) private readonly membersRepo: Repository<ProjectMember>,
  ) {}

  async findAllForUser(userId: string) {
    // Only projects the user is a member of — never trust a client-supplied filter for this;
    // membership itself is the filter, enforced here in SQL, not just via the route guard.
    // Task count via a correlated subquery (SELECT COUNT(*) FROM tasks WHERE ...) rather than
    // a second query per project — avoids the classic N+1.
    const rows = await this.projectsRepo
      .createQueryBuilder('project')
      .innerJoin('project_members', 'pm', 'pm.project_id = project.id AND pm.user_id = :userId', { userId })
      .loadRelationCountAndMap('project.taskCount', 'project.tasks')
      .getMany();
    return rows;
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto, creatorUserId: string): Promise<Project> {
    const project = this.projectsRepo.create(dto);
    const saved = await this.projectsRepo.save(project);
    // Creator is automatically a member so they can immediately see/manage it.
    await this.membersRepo.save(this.membersRepo.create({ projectId: saved.id, userId: creatorUserId }));
    return saved;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.projectsRepo.delete(id);
  }
}
