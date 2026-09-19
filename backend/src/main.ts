// Application entry point — analogous to Program.cs in ASP.NET Core (creates the host, wires
// global middleware/pipes, then Listen()s). NestFactory.create() is the Kestrel bootstrap.
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  // Global ValidationPipe = the ASP.NET Core ModelState/DataAnnotations validation pipeline,
  // but driven by class-validator decorators on our DTOs instead of [Required]/[MaxLength].
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
