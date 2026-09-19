// Second migration — creates the projects table with a Postgres ENUM for status,
// the closest raw-SQL equivalent of a C# enum column mapped via EF Core's HasConversion.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjects1700000002000 implements MigrationInterface {
  name = 'CreateProjects1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE project_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'ON_HOLD');
    `);
    await queryRunner.query(`
      CREATE TABLE projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        status project_status_enum NOT NULL DEFAULT 'ACTIVE',
        start_date DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
    await queryRunner.query(`DROP TYPE IF EXISTS project_status_enum;`);
  }
}
