/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { SERVICE_PORTS, QUEUE_NOTIFICATION } from '@puchi-be/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: QUEUE_NOTIFICATION,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log(`Notification Service is running on port ${SERVICE_PORTS.NOTIFICATION_SERVICE}`);
}

bootstrap();
