// Project entity — status uses a TS enum mapped to the Postgres ENUM type from migration 002.
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'client_name' })
  clientName: string;

  @Column({ type: 'enum', enum: ProjectStatus, enumName: 'project_status_enum', default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Inverse side only, used for loadRelationCountAndMap('project.taskCount', 'project.tasks')
  // — the query-builder count-subquery trick, not eager-loaded row data.
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  // Populated only by loadRelationCountAndMap; not a DB column.
  taskCount?: number;
}
