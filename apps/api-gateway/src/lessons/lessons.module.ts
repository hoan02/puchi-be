import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LessonsController } from './lessons.controller';
import { LESSON_SERVICE_RABBITMQ } from '../constants';

@Module({
  imports: [
    ClientsModule.register([
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
    ])
  ],
  controllers: [LessonsController],
})
export class LessonsModule { } 