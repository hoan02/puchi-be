/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ANALYTICS_CLIENT_KAFKA_OPTIONS } from '@puchi-be/shared';

async function bootstrap() {
  const logger = new Logger('Analytics Service');

  // Tạo microservice app với Kafka transport
  const app = await NestFactory.createMicroservice(
    AppModule,
    ANALYTICS_CLIENT_KAFKA_OPTIONS
  );

  await app.listen();
  logger.log('🚀 Analytics Service Microservice is running with Kafka transport');
}

bootstrap();
