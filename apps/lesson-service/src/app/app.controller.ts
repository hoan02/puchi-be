import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AUDIO_CLIENT, NOTIFICATION_CLIENT, PROGRESS_CLIENT, VOCAB_CLIENT } from '../constants';
import { CreateLessonDto, Lesson } from '@puchi-be/shared';
import { PrismaService } from '@puchi-be/database';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Inject(PROGRESS_CLIENT) private readonly progressRMQClient: ClientProxy,
    @Inject(AUDIO_CLIENT) private readonly audioRMQClient: ClientProxy,
    @Inject(NOTIFICATION_CLIENT) private readonly notificationRMQClient: ClientProxy,
    @Inject(VOCAB_CLIENT) private readonly vocabRMQClient: ClientProxy,
  ) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern("lesson-created")
  async handleLessonCreated(@Payload() lessonData: CreateLessonDto) {
    try {
      this.logger.log(`Processing lesson creation: ${lessonData.title}`);

      // Save lesson to database
      const savedLesson = await this.prismaService.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          durationMinutes: lessonData.durationMinutes,
        },
      });

      this.logger.log(`Lesson saved with ID: ${savedLesson.id}`);

      // Emit events to other services with the saved lesson data
      await Promise.all([
        this.progressRMQClient.emit("lesson-process", savedLesson).toPromise(),
        this.notificationRMQClient.emit("lesson-notification", savedLesson).toPromise(),
        this.audioRMQClient.emit("lesson-audio", savedLesson).toPromise(),
        this.vocabRMQClient.emit("lesson-vocab", savedLesson).toPromise(),
      ]);

      this.logger.log(`All events emitted successfully for lesson: ${savedLesson.id}`);
    } catch (error) {
      this.logger.error(`Error processing lesson creation: ${error.message}`, error.stack);
      // Emit error event for monitoring
      await this.notificationRMQClient.emit("lesson-error", {
        error: error.message,
        lessonData,
        timestamp: new Date().toISOString(),
      }).toPromise();
    }
  }
}
