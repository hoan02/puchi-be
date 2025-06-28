import { Module } from '@nestjs/common';
import { SharedClientsModule } from '@puchi-be/shared';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [SharedClientsModule],
  controllers: [LessonsController],
})
export class LessonsModule { } 