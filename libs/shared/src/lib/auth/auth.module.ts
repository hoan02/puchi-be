import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, UsersModule, ConfigModule],
  providers: [ClerkStrategy, ClerkAuthGuard],
  exports: [PassportModule, ClerkStrategy, ClerkAuthGuard],
})
export class AuthModule { }