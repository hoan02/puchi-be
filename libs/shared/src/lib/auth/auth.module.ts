import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { ClerkClientProvider } from '../providers/clerk-client.provider';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, ConfigModule],
  providers: [ClerkStrategy, ClerkAuthGuard, ClerkClientProvider],
  exports: [PassportModule, ClerkStrategy, ClerkAuthGuard],
})
export class AuthModule { }