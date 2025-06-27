import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Query, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { LESSON_SERVICE_RABBITMQ } from '../constants';
import { CreateLessonDto, LessonResponseDto } from '@puchi-be/shared';
import { ClerkGuard } from '@puchi-be/shared';
import { CurrentUser, UserPayload } from '@puchi-be/shared';

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
  @UseGuards(ClerkGuard)
  async createLesson(@Body() lesson: CreateLessonDto, @CurrentUser() user: UserPayload) {
    try {
      // Validate lesson data
      if (!lesson.title || !lesson.durationMinutes) {
        throw new HttpException('Invalid lesson data', HttpStatus.BAD_REQUEST);
      }

      // Add user info to lesson data
      const lessonWithUser = {
        ...lesson,
        createdBy: user.id,
        userEmail: user.email,
      };

      // Emit event with error handling
      await this.client.emit("lesson-created", lessonWithUser).toPromise();

      return {
        message: "Lesson sent to RabbitMQ successfully",
        lesson: lessonWithUser,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new HttpException(
        'Failed to create lesson',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("lessons")
  @UseGuards(ClerkGuard)
  async getLessons(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: UserPayload
  ) {
    try {
      const response = await this.client.send('get-lessons', {
        page: parseInt(page),
        limit: parseInt(limit),
        userId: user.id
      }).toPromise();

      return {
        data: response,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new HttpException(
        'Failed to fetch lessons',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("lesson/:id")
  @UseGuards(ClerkGuard)
  async getLessonById(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    try {
      const lesson = await this.client.send('get-lesson-by-id', {
        id,
        userId: user.id
      }).toPromise();

      if (!lesson) {
        throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
      }

      return {
        data: lesson,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error fetching lesson:', error);
      throw new HttpException(
        'Failed to fetch lesson',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("my-progress")
  @UseGuards(ClerkGuard)
  async getMyProgress(@CurrentUser() user: UserPayload) {
    try {
      const progress = await this.client.send('get-user-progress', {
        userId: user.id
      }).toPromise();

      return {
        data: progress,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw new HttpException(
        'Failed to fetch user progress',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
