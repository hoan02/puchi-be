import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { SERVICE_PORTS, QUEUE_USER } from '@puchi-be/shared';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: QUEUE_USER,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log(`User Service is running on port ${SERVICE_PORTS.USER_SERVICE}`);
}

bootstrap(); 
