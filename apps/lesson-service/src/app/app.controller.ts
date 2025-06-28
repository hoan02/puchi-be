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
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROGRESS_SERVICE') private readonly progressClient: ClientProxy,
    @Inject(AUDIO_CLIENT) private readonly audioRMQClient: ClientProxy,
    @Inject(NOTIFICATION_CLIENT) private readonly notificationRMQClient: ClientProxy,
    @Inject(VOCAB_CLIENT) private readonly vocabRMQClient: ClientProxy,
  ) { }

  @Get()
  getData() {
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
        this.progressClient.emit("lesson-available", {
          lessonId: savedLesson.id,
          userId: user.id,
          title: savedLesson.title,
          durationMinutes: savedLesson.durationMinutes
        }).toPromise(),

        // Notify user service about new lesson creation
        this.userClient.emit("user-activity", {
          userId: user.id,
          activity: 'lesson_created',
          lessonId: savedLesson.id,
          timestamp: new Date().toISOString()
        }).toPromise(),
      ]);

      this.logger.log(`All events emitted successfully for lesson: ${savedLesson.id}`);

      return {
        success: true,
        lesson: savedLesson,
        message: 'Lesson created successfully'
      };
    } catch (error) {
      this.logger.error(`Error processing lesson creation: ${error.message}`, error.stack);

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
        where: {
          createdBy: user.id,
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
          createdBy: user.id,
        },
      });

      return {
        success: true,
        data: {
          lessons,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        }
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

      const lesson = await this.prismaService.lesson.findFirst({
        where: {
          id,
          createdBy: user.id,
        },
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
      this.logger.error(`Error fetching lesson by ID: ${error.message}`, error.stack);
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
