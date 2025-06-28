import { Module } from '@nestjs/common';
import { SharedClientsModule } from '@puchi-be/shared';
import { ProgressController } from './progress.controller';

@Module({
  imports: [SharedClientsModule],
  controllers: [ProgressController],
})
export class ProgressModule { } 