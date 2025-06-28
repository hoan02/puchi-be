/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { SERVICE_PORTS, QUEUE_PROGRESS } from '@puchi-be/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: QUEUE_PROGRESS,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log(`Progress Service is running on port ${SERVICE_PORTS.PROGRESS_SERVICE}`);
}

bootstrap();
