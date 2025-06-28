import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedClientsModule, KafkaModule } from '@puchi-be/shared';
import { DatabaseModule } from '@puchi-be/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedClientsModule,
    KafkaModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
