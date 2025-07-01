import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices/client';
import { PrismaService } from '@puchi-be/database';
import {
  CLIENT_KAFKA_NAMES,
  LessonCreatedEvent,
} from '@puchi-be/shared';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Inject(CLIENT_KAFKA_NAMES.USER_CLIENT) private readonly userClient: ClientKafka,
    @Inject(CLIENT_KAFKA_NAMES.PROGRESS_CLIENT) private readonly progressClient: ClientKafka,
  ) { }

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }

  @MessagePattern("lesson-created")
  async handleLessonCreated(@Payload() eventData: string) {
    try {
      // Deserialize event
      const event = LessonCreatedEvent.fromString(eventData) as LessonCreatedEvent;
      this.logger.log(`Processing lesson creation: ${event.title} by user: ${event.createdBy}`);

      // Validate lesson data
      if (!event.title || !event.durationMinutes) {
        throw new Error('Invalid lesson data: title and durationMinutes are required');
      }

      // Save lesson to database
      const savedLesson = await this.prismaService.lesson.create({
        data: {
          title: event.title,
          description: event.description,
          durationMinutes: event.durationMinutes,
          createdBy: event.createdBy,
        },
      });

      this.logger.log(`Lesson saved with ID: ${savedLesson.id}`);

      // Notify progress service to create progress tracking
      await this.progressClient.emit("lesson-available", {
        lessonId: savedLesson.id,
        userId: event.createdBy,
        title: savedLesson.title,
        durationMinutes: savedLesson.durationMinutes
      }).toPromise();

      // Notify user service about new lesson creation
      await this.userClient.emit("user-activity", {
        userId: event.createdBy,
        activity: 'lesson_created',
        lessonId: savedLesson.id,
        timestamp: new Date().toISOString()
      }).toPromise();

      return {
        success: true,
        data: savedLesson,
        message: 'Lesson created successfully'
      };
    } catch (error) {
      this.logger.error(`Error creating lesson: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @MessagePattern("get-lessons")
  async handleGetLessons(@Payload() data: { page: number; limit: number; user: { id: string } }) {
    try {
      const { page, limit, user } = data;
      const skip = (page - 1) * limit;

      const lessons = await this.prismaService.lesson.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prismaService.lesson.count();

      return {
        success: true,
        data: {
          lessons,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching lessons: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @MessagePattern("get-lesson-by-id")
  async handleGetLessonById(@Payload() data: { id: string; user: { id: string } }) {
    try {
      const { id, user } = data;

      const lesson = await this.prismaService.lesson.findUnique({
        where: { id },
      });

      if (!lesson) {
        return {
          success: false,
          error: 'Lesson not found'
        };
      }

      return {
        success: true,
        data: lesson
      };
    } catch (error) {
      this.logger.error(`Error fetching lesson: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @MessagePattern("get-user-progress")
  async handleGetUserProgress(@Payload() data: { user: { id: string } }) {
    try {
      const { user } = data;

      const progress = await this.prismaService.userProgress.findMany({
        where: {
          userId: user.id,
        },
        include: {
          lesson: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return {
        success: true,
        data: progress
      };
    } catch (error) {
      this.logger.error(`Error fetching user progress: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
