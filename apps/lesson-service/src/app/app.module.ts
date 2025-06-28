import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUDIO_CLIENT, NOTIFICATION_CLIENT, PROGRESS_CLIENT, VOCAB_CLIENT } from '../constants';
import { DatabaseModule } from '@puchi-be/database';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: PROGRESS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'progress_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: AUDIO_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'audio_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: NOTIFICATION_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: VOCAB_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'vocab_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'user_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'PROGRESS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'progress_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
