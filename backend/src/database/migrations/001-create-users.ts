// TypeORM migration — like an EF Core Migration's Up()/Down(), but we write raw SQL via
// queryRunner.query() instead of the fluent MigrationBuilder API.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1700000001000 implements MigrationInterface {
  name = 'CreateUsers1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
