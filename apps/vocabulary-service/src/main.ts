/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { VOCABULARY_CLIENT_KAFKA_OPTIONS } from '@puchi-be/shared';

async function bootstrap() {
  const logger = new Logger('Vocabulary Service');

  // Khởi tạo gRPC microservice
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'vocabulary',
      protoPath: join(__dirname, '../../../proto/vocabulary.proto'),
      url: '0.0.0.0:50057',
    },
  });

  // Khởi tạo Kafka microservice
  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, VOCABULARY_CLIENT_KAFKA_OPTIONS);

  // Lắng nghe cả hai
  await Promise.all([grpcApp.listen(), kafkaApp.listen()]);

  logger.log('🚀 Vocabulary Service is running with gRPC and Kafka transport');
}

bootstrap();
