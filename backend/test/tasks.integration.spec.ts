// Integration test — boots the real Nest app + a real Postgres connection (via TypeORM,
// pointed at DB_HOST/etc. from .env or CI env vars) and drives it over HTTP with supertest,
// the same shape as an ASP.NET Core WebApplicationFactory<Program> integration test.
//
// Requires a running Postgres reachable with the DB_* env vars (see backend/.env.example) and
// migrations applied (`npm run migration:run`). Not executed in this sandbox (no live Postgres
// available here) — run it locally/in CI with `npm test` after `docker-compose up -d postgres`.
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Tasks filtering + membership (integration, real Postgres)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let memberToken: string;
  let nonMemberToken: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleRef.get(DataSource);

    const passwordHash = await bcrypt.hash('password123', 10);
    const [member] = await dataSource.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
      [`member-${Date.now()}@test.com`, passwordHash, 'Member User'],
    );
    const [nonMember] = await dataSource.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
      [`nonmember-${Date.now()}@test.com`, passwordHash, 'Non Member'],
    );
    const [project] = await dataSource.query(
      `INSERT INTO projects (name, client_name, status, start_date) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Integration Test Project', 'Test Client', 'ACTIVE', '2026-01-01'],
    );
    projectId = project.id;
    await dataSource.query(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`, [
      projectId,
      member.id,
    ]);
    await dataSource.query(
      `INSERT INTO tasks (title, project_id, status, due_date) VALUES ($1, $2, $3, $4)`,
      ['Task A', projectId, 'TODO', '2026-02-01'],
    );
    await dataSource.query(
      `INSERT INTO tasks (title, project_id, status, due_date) VALUES ($1, $2, $3, $4)`,
      ['Task B', projectId, 'COMPLETED', '2026-02-05'],
    );

    const memberLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: (await dataSource.query('SELECT email FROM users WHERE id = $1', [member.id]))[0].email, password: 'password123' });
    memberToken = memberLogin.body.accessToken;

    const nonMemberLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: (await dataSource.query('SELECT email FROM users WHERE id = $1', [nonMember.id]))[0].email, password: 'password123' });
    nonMemberToken = nonMemberLogin.body.accessToken;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
    await dataSource.query('DELETE FROM project_members WHERE project_id = $1', [projectId]);
    await dataSource.query('DELETE FROM projects WHERE id = $1', [projectId]);
    await app.close();
  });

  it('filters tasks by status for a project member', async () => {
    const res = await request(app.getHttpServer())
      .get(`/projects/${projectId}/tasks?status=TODO`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(res.body.items.every((t: any) => t.status === 'TODO')).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 403 for a user who is not a project member', async () => {
    await request(app.getHttpServer())
      .get(`/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${nonMemberToken}`)
      .expect(403);
  });
});
