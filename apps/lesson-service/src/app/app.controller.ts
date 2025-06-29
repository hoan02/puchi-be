import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices/client';
import { PrismaService } from '@puchi-be/database';
import {
  CLIENT_KAFKA_NAMES,
  LessonCreatedEvent,
  BaseController,
} from '@puchi-be/shared';

@Controller()
export class AppController extends BaseController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Inject(CLIENT_KAFKA_NAMES.USER_CLIENT) private readonly userClient: ClientKafka,
    @Inject(CLIENT_KAFKA_NAMES.PROGRESS_CLIENT) private readonly progressClient: ClientKafka,
  ) {
    super('LessonService', '1.0.0', 8002);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('user-service', this.userClient);
    this.registerServiceClient('progress-service', this.progressClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo database connection
    await this.prismaService.$connect();
    this.logger.log('Database connection established');
  }

  async cleanupResources(): Promise<void> {
    await this.prismaService.$disconnect();
    this.logger.log('Database connection closed');
  }

  async registerHealthCheck(): Promise<void> {
    // Đăng ký health check với service registry (có thể implement sau)
    this.logger.log('Health check registered');
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    // Deregister từ service registry (có thể implement sau)
    this.logger.log('Deregistered from service registry');
  }

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

      // Sử dụng ServiceClient với circuit breaker
      await Promise.all([
        // Notify progress service to create progress tracking
        this.emitToService('progress-service', "lesson-available", {
          lessonId: savedLesson.id,
          userId: event.createdBy,
          title: savedLesson.title,
          durationMinutes: savedLesson.durationMinutes
        }, { timeout: 5000, retries: 3 }),

        // Notify user service about new lesson creation
        this.emitToService('user-service', "user-activity", {
          userId: event.createdBy,
          activity: 'lesson_created',
          lessonId: savedLesson.id,
          timestamp: new Date().toISOString()
        }, { timeout: 5000, retries: 3 }),
      ]);

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
