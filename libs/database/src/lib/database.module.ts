import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [PrismaService],
  providers: [],
  exports: [PrismaService],
})
export class DatabaseModule { }
