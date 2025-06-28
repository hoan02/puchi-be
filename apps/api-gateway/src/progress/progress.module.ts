import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
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
  controllers: [ProgressController],
})
export class ProgressModule { } 