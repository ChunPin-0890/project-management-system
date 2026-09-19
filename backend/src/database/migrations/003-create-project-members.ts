// Join table migration — like an EF Core many-to-many join entity, but explicit here since
// we need it as a first-class table the ProjectMembersGuard queries directly.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectMembers1700000003000 implements MigrationInterface {
  name = 'CreateProjectMembers1700000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (project_id, user_id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_members;`);
  }
}
