import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { LESSON_SERVICE_RABBITMQ } from '../constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(LESSON_SERVICE_RABBITMQ) private readonly client: ClientProxy
  ) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post("lesson")
  createLesson(@Body() lesson: any) {
    this.client.emit("lesson-created", lesson)
    return {
      message: "Lesson sent to RabbitMQ",
      lesson
    }
  }
}
