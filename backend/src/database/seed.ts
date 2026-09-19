// One-off seed script — like an EF Core `dbContext.SeedData()` call or a SQL seed script run
// once after migrations. Creates demo users, a project, memberships, and a couple of tasks.
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';

async function seed() {
  await dataSource.initialize();

  const passwordHash = await bcrypt.hash('password123', 10);

  const existing = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['alice@example.com']);
  let aliceId: string;
  let bobId: string;

  if (existing.length) {
    aliceId = existing[0].id;
  } else {
    const [alice] = await dataSource.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
      ['alice@example.com', passwordHash, 'Alice Anderson'],
    );
    aliceId = alice.id;
  }

  const existingBob = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['bob@example.com']);
  if (existingBob.length) {
    bobId = existingBob[0].id;
  } else {
    const [bob] = await dataSource.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
      ['bob@example.com', passwordHash, 'Bob Brown'],
    );
    bobId = bob.id;
  }

  const existingProject = await dataSource.query(`SELECT id FROM projects WHERE name = $1`, ['Website Redesign']);
  let projectId: string;
  if (existingProject.length) {
    projectId = existingProject[0].id;
  } else {
    const [project] = await dataSource.query(
      `INSERT INTO projects (name, client_name, status, start_date) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Website Redesign', 'Acme Corp', 'ACTIVE', '2026-01-15'],
    );
    projectId = project.id;

    await dataSource.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [projectId, aliceId],
    );

    await dataSource.query(
      `INSERT INTO tasks (title, project_id, status, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5)`,
      ['Design homepage mockup', projectId, 'IN_PROGRESS', aliceId, '2026-03-01'],
    );
    await dataSource.query(
      `INSERT INTO tasks (title, project_id, status, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5)`,
      ['Set up hosting', projectId, 'TODO', bobId, '2026-03-10'],
    );
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete. Demo login: alice@example.com / password123 (member of "Website Redesign").');
  console.log('bob@example.com / password123 exists but is NOT a member of "Website Redesign" — use to test 403.');

  await dataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
