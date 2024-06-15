import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { JwtMiddleware } from './jwt.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(JwtMiddleware);

  await app.listen(5000);
}
bootstrap();
