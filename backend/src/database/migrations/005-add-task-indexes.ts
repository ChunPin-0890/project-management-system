// Index-only migration — like an EF Core migration that only adds HasIndex() calls.
// Speeds up the filter combinations the tasks endpoint supports (status/assignee/due-date/project).
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskIndexes1700000005000 implements MigrationInterface {
  name = 'AddTaskIndexes1700000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX idx_tasks_project_id ON tasks(project_id);`);
    await queryRunner.query(`CREATE INDEX idx_tasks_status ON tasks(status);`);
    await queryRunner.query(`CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);`);
    await queryRunner.query(`CREATE INDEX idx_tasks_due_date ON tasks(due_date);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_project_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_assignee_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_due_date;`);
  }
}
