import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Query, Param, UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public, CLIENT_NAMES } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('lessons')
export class LessonsController {
  private readonly logger = new Logger(LessonsController.name);

  constructor(
    @Inject(CLIENT_NAMES.LESSON_SERVICE) private readonly lessonClient: ClientProxy
  ) { }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async createLesson(@Body() lesson: any, @CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Creating lesson: ${lesson.title} by user: ${user.id}`);

    try {
      await firstValueFrom(this.lessonClient.emit("lesson-created", {
        lesson,
        user: { id: user.id, email: user.email }
      }));

      this.logger.log(`Lesson created successfully: ${lesson.title}`);

      return {
        message: "Lesson request sent to lesson service",
        lesson,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error creating lesson: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to process lesson request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('list')
  @UseGuards(ClerkAuthGuard)
  async getLessons(@CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting lessons for user: ${user.id}`);

    try {
      const response = await firstValueFrom(this.lessonClient.send('get-lessons', {
        page: 1,
        limit: 10,
        userId: user.id
      }));

      if (!response.success) {
        this.logger.warn(`Failed to get lessons: ${response.error}`);
        throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Retrieved ${response.data.lessons?.length || 0} lessons for user: ${user.id}`);

      return {
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error fetching lessons: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch lessons',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @UseGuards(ClerkAuthGuard)
  async getLessonById(@Param('id') id: string, @CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting lesson by ID: ${id} for user: ${user.id}`);

    try {
      const response = await firstValueFrom(this.lessonClient.send('get-lesson-by-id', {
        id,
        userId: user.id
      }));

      if (!response.success) {
        this.logger.warn(`Lesson not found: ${id}`);
        throw new HttpException(response.error, HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Retrieved lesson: ${id}`);

      return {
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching lesson: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to fetch lesson',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-progress')
  @UseGuards(ClerkAuthGuard)
  async getMyProgress(@CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting progress for user: ${user.id}`);

    try {
      const response = await firstValueFrom(this.lessonClient.send('get-user-progress', {
        userId: user.id
      }));

      if (!response.success) {
        this.logger.warn(`Failed to get progress: ${response.error}`);
        throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Retrieved progress for user: ${user.id}`);

      return {
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error fetching user progress: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user progress',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('public-list')
  @Public()
  async getPublicLessons() {
    this.logger.log('Getting public lessons');

    return {
      message: 'Public lessons information',
      timestamp: new Date().toISOString()
    };
  }
} 