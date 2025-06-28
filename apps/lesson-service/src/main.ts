import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SERVICE_PORTS, QUEUE_LESSON } from '@puchi-be/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: QUEUE_LESSON,
        queueOptions: {
          durable: true,
        }
      }
    }
  );
  await app.listen();
  console.log(`Lesson Service is running on port ${SERVICE_PORTS.LESSON_SERVICE}`);
}

bootstrap();
