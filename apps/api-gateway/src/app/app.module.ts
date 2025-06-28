import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedClientsModule } from '@puchi-be/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedClientsModule,
    UsersModule,
    LessonsModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
