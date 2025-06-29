import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import {
  API_GATEWAY_CLIENT_KAFKA_MODULE,
  LESSON_CLIENT_KAFKA_MODULE,
  USER_CLIENT_KAFKA_MODULE,
  PROGRESS_CLIENT_KAFKA_MODULE,
  AuthModule
} from '@puchi-be/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../controllers/users.controller';
import { LessonsController } from '../controllers/lessons.controller';
import { ProgressController } from '../controllers/progress.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      API_GATEWAY_CLIENT_KAFKA_MODULE,
      LESSON_CLIENT_KAFKA_MODULE,
      USER_CLIENT_KAFKA_MODULE,
      PROGRESS_CLIENT_KAFKA_MODULE,
    ]),
    AuthModule,
  ],
  controllers: [
    AppController,
    UsersController,
    LessonsController,
    ProgressController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
