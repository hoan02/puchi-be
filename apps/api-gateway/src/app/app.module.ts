import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LESSON_SERVICE_RABBITMQ } from '../constants';

@Module({
  imports: [ClientsModule.register([
    {
      name: LESSON_SERVICE_RABBITMQ,
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'lesson_queue',
        queueOptions: {
          durable: true,
        }
      }
    }
  ])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
