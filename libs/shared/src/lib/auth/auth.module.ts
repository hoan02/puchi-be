import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, ConfigModule],
  providers: [],
  exports: [PassportModule],
})
export class AuthModule { }