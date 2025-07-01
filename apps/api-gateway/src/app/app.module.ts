import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthModule, ResponseInterceptor } from '@puchi-be/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../controllers/users.controller';
import { LessonsController } from '../controllers/lessons.controller';
import { ProgressController } from '../controllers/progress.controller';
import { NotificationController } from '../controllers/notification.controller';
import { MediaController } from '../controllers/media.controller';
import { QuizController } from '../controllers/quiz.controller';
import { VocabularyController } from '../controllers/vocabulary.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import { HealthController } from '../controllers/health.controller';
import { CustomExceptionFilter } from '../custom-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../proto/user.proto'),
          url: process.env.USER_SERVICE_GRPC_URL || 'localhost:50051',
        },
      },
      {
        name: 'LESSON_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'lesson',
          protoPath: join(__dirname, '../../../proto/lesson.proto'),
          url: process.env.LESSON_SERVICE_GRPC_URL || 'localhost:50052',
        },
      },
      {
        name: 'PROGRESS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'progress',
          protoPath: join(__dirname, '../../../proto/progress.proto'),
          url: process.env.PROGRESS_SERVICE_GRPC_URL || 'localhost:50053',
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'notification',
          protoPath: join(__dirname, '../../../proto/notification.proto'),
          url: process.env.NOTIFICATION_SERVICE_GRPC_URL || 'localhost:50054',
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(__dirname, '../../../proto/media.proto'),
          url: process.env.MEDIA_SERVICE_GRPC_URL || 'localhost:50055',
        },
      },
      {
        name: 'QUIZ_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'quiz',
          protoPath: join(__dirname, '../../../proto/quiz.proto'),
          url: process.env.QUIZ_SERVICE_GRPC_URL || 'localhost:50056',
        },
      },
      {
        name: 'VOCABULARY_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'vocabulary',
          protoPath: join(__dirname, '../../../proto/vocabulary.proto'),
          url: process.env.VOCABULARY_SERVICE_GRPC_URL || 'localhost:50057',
        },
      },
      {
        name: 'ANALYTICS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'analytics',
          protoPath: join(__dirname, '../../../proto/analytics.proto'),
          url: process.env.ANALYTICS_SERVICE_GRPC_URL || 'localhost:50058',
        },
      },
    ]),
    AuthModule,
    HttpModule,
  ],
  controllers: [
    AppController,
    UsersController,
    LessonsController,
    ProgressController,
    NotificationController,
    MediaController,
    QuizController,
    VocabularyController,
    AnalyticsController,
    HealthController,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule { }
