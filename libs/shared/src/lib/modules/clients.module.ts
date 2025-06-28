import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KAFKA_CLIENTS_CONFIG } from '../constants';

@Module({
  imports: [
    // Service-specific Clients
    ClientsModule.register([
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.USER_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.USER_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.USER_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.LESSON_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.PROGRESS_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.MEDIA_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.NOTIFICATION_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.VOCABULARY_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.QUIZ_SERVICE.options,
      },
      {
        name: KAFKA_CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.name,
        transport: KAFKA_CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.transport as any,
        options: KAFKA_CLIENTS_CONFIG.SERVICES.ANALYTICS_SERVICE.options,
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SharedClientsModule { } 