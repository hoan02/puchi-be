import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @GrpcMethod('ProgressService', 'GetUserProgress')
  getUserProgress(data: { userId: string }) {
    // Demo trả về dữ liệu mẫu
    return {
      userId: data.userId,
      completedLessons: 10,
      totalLessons: 50,
    };
  }
}
