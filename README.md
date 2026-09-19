# Project Management System (Client Project Tracker)

Angular (standalone components) + NestJS + PostgreSQL. Users log in, see only the projects they are
members of, and manage tasks with filtering, pagination, and optimistic-concurrency-safe edits.

## Setup (start to finish)

Prerequisite: Docker Desktop.

```bash
docker compose up --build -d        # postgres + backend (runs migrations on start) + frontend
docker compose exec backend npx ts-node src/database/seed.ts   # demo users/project/tasks
```

Open http://localhost:4200 (API at http://localhost:3000).

**Demo logins** (password for both: `password123`)
- `alice@example.com` - member of "Website Redesign"
- `bob@example.com` - NOT a member of it (use to verify the 403)

### Migrations manually

Migrations run automatically when the backend container starts. To run them by hand:

```bash
docker compose exec backend npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
docker compose exec backend npx typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts
```

### Local development without Docker for the apps

```bash
docker compose up -d postgres
cd backend && cp .env.example .env && npm install
npm run migration:run && npm run seed && npm run start:dev
cd ../frontend && npm install && npm start      # http://localhost:4200, proxies /api -> :3000
```

### Tests

```bash
cd backend
npm test                    # 9 unit tests (mocked repos), no database needed
npm run test:integration    # supertest against a REAL Postgres (needs DB up + migrations applied)
```

The integration test (`backend/test/tasks.integration.spec.ts`) creates its own users/project/tasks,
logs in over HTTP, checks task filtering by status, and checks a non-member gets 403.

## Design decisions and trade-offs

- **JWT in memory, not localStorage.** The token lives in an `AuthService` BehaviorSubject, so XSS
  cannot read it from storage. Cost: a page refresh logs you out (no refresh tokens, see below).
- **TypeORM over Prisma.** Migrations are `up()/down()` classes with raw SQL via `queryRunner`, the
  closest match to EF Core migrations; `synchronize` is off, so the schema is only ever changed by migrations.
- **Authorization is server-side only.** `ProjectMembersGuard` looks up `project_members` by the route's
  project id and the authenticated user id on every request; non-members get 403. The project list is
  itself filtered by membership in SQL. The Angular route guard is UX only.
- **Offset pagination with a stable sort.** `ORDER BY due_date ASC NULLS LAST, id ASC`; the `id`
  tiebreaker prevents rows shifting between pages. Trade-off: offset gets slow for very deep pages;
  keyset pagination would fix that but is overkill here.
- **No NgRx.** Services hold state in RxJS `BehaviorSubject`s and components use the `async` pipe.
  Fine at this size; a bigger app would justify a store.
- **Indexes** on `tasks(project_id, status, assignee_id, due_date)` (migration 005) match the filters.
- **Project task count** uses TypeORM `loadRelationCountAndMap`: one extra grouped COUNT query for all
  projects (not one per project), so no N+1.

## Concurrent edits

Each task has a `version` integer (default 1). The client sends the version it read with an update;
the server compares it to the stored version. If they differ it returns **409 Conflict**; otherwise it
saves and increments `version`. In the UI a 409 shows a message and a "Reload latest" button, keeps the
user's edits on screen until they choose to reload, and never overwrites silently.

Optimistic (not pessimistic locking) fits because this is a low-contention internal tool: two people
rarely edit the same task at once, so holding row locks or "checked out" flags across a user's think
time would add cost and stale-lock problems for a rare case. Conflicts are detected cheaply and the
rare loser just reloads. (Note: the check is read-then-write in application code; a strict guarantee
under true simultaneous requests would use `UPDATE ... WHERE id=$1 AND version=$2` and check the
affected row count. That is listed under next steps.)

## Deprioritized / next steps

- No refresh tokens (15 minute access token; you log in again)
- No password reset or user registration UI (users are seeded)
- No file uploads, no websockets/live updates
- No NgRx; no frontend automated tests
- Atomic `UPDATE ... WHERE version = $n` for the concurrency check (see above)
- Project membership management UI (members are added by seed/creator only)

## AI usage

Claude Code was used to scaffold this project against an approved plan: it generated the migrations,
CRUD boilerplate, DTOs, unit/integration tests, Angular components, and ported the design tokens into
`frontend/src/styles.css`. I reviewed and adjusted the output. One specific adjustment: the first
draft of `ProjectsService.findAllForUser` was a tangle of query-builder chains with `.catch()`
fallbacks calling `loadRelationCountAndMap` on a relation that did not exist on the entity. I replaced
it with a single query and added the real `Project.tasks` / `Task.project` relations so the
membership-filtered list and the task count come from one clear path. The membership guard also reads
only the user id from the JWT and re-checks membership in the database rather than trusting any claim.
Design tokens were checked against the spec values.

## Layout

```
backend/   NestJS API (src/auth, users, projects, tasks, database/migrations, common; test/)
frontend/  Angular standalone app (src/app/core, features, shared)
docker-compose.yml
```
