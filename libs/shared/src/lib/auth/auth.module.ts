import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, ConfigModule],
  providers: [ClerkStrategy, ClerkAuthGuard],
  exports: [PassportModule, ClerkStrategy, ClerkAuthGuard],
})
export class AuthModule { }