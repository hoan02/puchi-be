import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@puchi-be/database';
import { ClientsModule } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { USER_CLIENT_KAFKA_MODULE } from '@puchi-be/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([USER_CLIENT_KAFKA_MODULE]),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
