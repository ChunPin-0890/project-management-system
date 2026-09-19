// Tasks table — includes a `version` integer column used for optimistic concurrency,
// the raw-SQL equivalent of EF Core's [ConcurrencyCheck]/RowVersion pattern.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1700000004000 implements MigrationInterface {
  name = 'CreateTasks1700000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');
    `);
    await queryRunner.query(`
      CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        status task_status_enum NOT NULL DEFAULT 'TODO',
        assignee_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        due_date DATE NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
    await queryRunner.query(`DROP TYPE IF EXISTS task_status_enum;`);
  }
}
