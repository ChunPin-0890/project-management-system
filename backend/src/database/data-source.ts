// TypeORM CLI entry point — like the DbContext + `dotnet ef` design-time factory in EF Core.
// Used only by the `migration:run` / `migration:revert` npm scripts, not by the running app
// (the app itself gets its connection via TypeOrmModule.forRootAsync in app.module.ts).
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'project_management',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
