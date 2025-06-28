import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateLessonDto, LessonResponseDto } from '@puchi-be/shared';
import { PrismaService } from '@puchi-be/database';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROGRESS_SERVICE') private readonly progressClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('VOCABULARY_SERVICE') private readonly vocabularyClient: ClientProxy,
  ) { }

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }

  @MessagePattern("lesson-created")
  async handleLessonCreated(@Payload() data: { lesson: CreateLessonDto; user: { id: string; email: string } }) {
    try {
      const { lesson: lessonData, user } = data;
      this.logger.log(`Processing lesson creation: ${lessonData.title} by user: ${user.id}`);

      // Validate lesson data
      if (!lessonData.title || !lessonData.durationMinutes) {
        throw new Error('Invalid lesson data: title and durationMinutes are required');
      }

      // Check if user exists, if not create user
      let dbUser = await this.prismaService.user.findUnique({
        where: { clerkId: user.id }
      });

      if (!dbUser) {
        dbUser = await this.prismaService.user.create({
          data: {
            clerkId: user.id,
            email: user.email,
          }
        });
        this.logger.log(`Created new user: ${dbUser.id}`);
      }

      // Save lesson to database
      const savedLesson = await this.prismaService.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          durationMinutes: lessonData.durationMinutes,
          createdBy: user.id,
        },
        include: {
          creator: true,
        }
      });

      this.logger.log(`Lesson saved with ID: ${savedLesson.id}`);

      // Emit events to other services
      await Promise.all([
        // Notify progress service to create progress tracking
        firstValueFrom(this.progressClient.emit("lesson-available", {
          lessonId: savedLesson.id,
          userId: user.id,
          title: savedLesson.title,
          durationMinutes: savedLesson.durationMinutes
        })),

        // Notify user service about new lesson creation
        firstValueFrom(this.userClient.emit("user-activity", {
          userId: user.id,
          activity: 'lesson_created',
          lessonId: savedLesson.id,
          timestamp: new Date().toISOString()
        })),
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
        include: {
          creator: true,
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
        include: {
          creator: true,
        },
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
