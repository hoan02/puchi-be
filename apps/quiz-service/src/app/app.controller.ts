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

  @GrpcMethod('QuizService', 'GetQuizById')
  getQuizById(data: { id: string, userId: string }) {
    // Demo trả về dữ liệu mẫu
    return {
      id: data.id,
      title: 'Demo Quiz',
      description: 'Mô tả quiz',
      totalQuestions: 20,
    };
  }
}
