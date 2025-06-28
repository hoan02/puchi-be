import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { CLIENTS_CONFIG } from '../constants';

@Module({
  imports: [
    // Main RabbitMQ Client
    ClientsModule.register([
      {
        name: CLIENTS_CONFIG.RABBITMQ.name,
        transport: CLIENTS_CONFIG.RABBITMQ.transport as any,
        options: CLIENTS_CONFIG.RABBITMQ.options,
      },
    ]),

    // Service-specific Clients
    ClientsModule.register([
      {
        name: CLIENTS_CONFIG.SERVICES.USER_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.USER_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.USER_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.options,
      },
      {
        name: CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.name,
        transport: CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.transport as any,
        options: CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.options,
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SharedClientsModule { } 