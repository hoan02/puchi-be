/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PROGRESS_CLIENT_KAFKA_OPTIONS } from '@puchi-be/shared';

async function bootstrap() {
  const logger = new Logger('Progress Service');

  // Khởi tạo gRPC microservice
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'progress',
      protoPath: join(__dirname, '../../../proto/progress.proto'),
      url: '0.0.0.0:50053',
    },
  });

  // Khởi tạo Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, PROGRESS_CLIENT_KAFKA_OPTIONS);

  // Lắng nghe cả hai
  await Promise.all([grpcApp.listen(), kafkaApp.listen()]);

  logger.log('🚀 Progress Service is running with gRPC and Kafka transport');
}

bootstrap();
