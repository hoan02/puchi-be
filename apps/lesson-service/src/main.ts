import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'lesson_queue',
        queueOptions: {
          durable: true,
        }
      }
    }
  );
  await app.listen();
  Logger.log(
    `🚀 Application is listening on RabbitQM...`,
  );
}

bootstrap();
