import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'progress-service',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern('get-user-progress')
  getUserProgress(@Payload() data: { userId: string }) {
    // Dummy data
    return {
      userId: data.userId,
      progress: Math.floor(Math.random() * 100),
      updatedAt: new Date().toISOString(),
    };
  }

  @MessagePattern('lesson-available')
  async handleLessonAvailable(@Payload() data: { lessonId: string; userId: string; title: string; durationMinutes: number }) {
    console.log(`Progress service: Creating progress tracking for lesson ${data.lessonId}`);

    // Tạo progress tracking cho lesson mới
    // Trong thực tế, bạn sẽ lưu vào database
    return {
      success: true,
      message: `Progress tracking created for lesson: ${data.title}`,
      data: {
        lessonId: data.lessonId,
        userId: data.userId,
        status: 'not_started',
        progress: 0,
        createdAt: new Date().toISOString()
      }
    };
  }
} 