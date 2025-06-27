import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AUDIO_CLIENT, NOTIFICATION_CLIENT, PROGRESS_CLIENT, VOCAB_CLIENT } from '../constants';
import { CreateLessonDto, LessonResponseDto } from '@puchi-be/shared';
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
  async handleLessonCreated(@Payload() lessonData: CreateLessonDto & { createdBy: string; userEmail?: string }) {
    try {
      this.logger.log(`Processing lesson creation: ${lessonData.title} by user: ${lessonData.createdBy}`);

      // Check if user exists, if not create user
      let user = await this.prismaService.user.findUnique({
        where: { clerkId: lessonData.createdBy }
      });

      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            clerkId: lessonData.createdBy,
            email: lessonData.userEmail || 'unknown@example.com',
          }
        });
        this.logger.log(`Created new user: ${user.id}`);
      }

      // Save lesson to database
      const savedLesson = await this.prismaService.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          durationMinutes: lessonData.durationMinutes,
          createdBy: lessonData.createdBy,
        },
        include: {
          creator: true,
        }
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

  @MessagePattern("get-lessons")
  async handleGetLessons(@Payload() data: { page: number; limit: number; userId: string }) {
    try {
      const { page, limit, userId } = data;
      const skip = (page - 1) * limit;

      const lessons = await this.prismaService.lesson.findMany({
        where: {
          createdBy: userId,
        },
        include: {
          creator: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prismaService.lesson.count({
        where: {
          createdBy: userId,
        },
      });

      return {
        lessons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching lessons: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern("get-lesson-by-id")
  async handleGetLessonById(@Payload() data: { id: string; userId: string }) {
    try {
      const { id, userId } = data;

      const lesson = await this.prismaService.lesson.findFirst({
        where: {
          id,
          createdBy: userId,
        },
        include: {
          creator: true,
        },
      });

      return lesson;
    } catch (error) {
      this.logger.error(`Error fetching lesson by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern("get-user-progress")
  async handleGetUserProgress(@Payload() data: { userId: string }) {
    try {
      const { userId } = data;

      const progress = await this.prismaService.userProgress.findMany({
        where: {
          userId,
        },
        include: {
          lesson: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return progress;
    } catch (error) {
      this.logger.error(`Error fetching user progress: ${error.message}`, error.stack);
      throw error;
    }
  }
}
