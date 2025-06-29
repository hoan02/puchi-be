/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LESSON_CLIENT_KAFKA_OPTIONS } from '@puchi-be/shared';

async function bootstrap() {
  const logger = new Logger('Lesson Service');

  // Tạo microservice app với Kafka transport
  const app = await NestFactory.createMicroservice(
    AppModule,
    LESSON_CLIENT_KAFKA_OPTIONS
  );

  await app.listen();
  logger.log('🚀 Lesson Service Microservice is running with Kafka transport');
}

bootstrap();
