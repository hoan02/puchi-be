import { Module } from '@nestjs/common';
import { SharedClientsModule } from '@puchi-be/shared';
import { UsersController } from './users.controller';

@Module({
  imports: [SharedClientsModule],
  controllers: [UsersController],
})
export class UsersModule { } 