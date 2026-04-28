import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow the Next.js frontend to talk to this API
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
