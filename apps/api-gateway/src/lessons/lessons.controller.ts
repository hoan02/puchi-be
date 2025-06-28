import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Query, Param, UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public, CLIENT_NAMES } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateLessonRequestDto, ApiResponseDto, LessonsListResponseDto, LessonResponseDto } from '../dto/lesson.dto';
import { CreateLessonEvent, GetLessonsEvent, GetLessonByIdEvent, GetUserProgressEvent } from '../events/lesson.events';
import { LessonCreatedEvent } from '@puchi-be/shared';

@Controller('lessons')
export class LessonsController {
  private readonly logger = new Logger(LessonsController.name);

  constructor(
    @Inject(CLIENT_NAMES.LESSON_SERVICE) private readonly lessonClient: ClientProxy
  ) { }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async createLesson(@Body() createLessonDto: CreateLessonRequestDto, @CurrentUser() user: any): Promise<ApiResponseDto<any>> {
    this.logger.log(`Creating lesson: ${createLessonDto.title} by user: ${user.id}`);

    try {
      const event = new LessonCreatedEvent(
        'temp-id', // Sẽ được generate bởi lesson service
        createLessonDto.title,
        createLessonDto.description,
        createLessonDto.durationMinutes,
        user.id,
      );

      const result = await this.lessonClient.emit('lesson-created', event.toString()).toPromise();

      this.logger.log(`Lesson created successfully: ${createLessonDto.title}`);

      return {
        data: { lesson: createLessonDto },
        message: "Lesson creation initiated",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error creating lesson: ${error.message}`, error.stack);
      return {
        data: null,
        message: "Failed to create lesson",
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('list')
  @UseGuards(ClerkAuthGuard)
  async getLessons(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<LessonsListResponseDto>> {
    this.logger.log(`Getting lessons for user: ${user.id}`);

    try {
      const event: GetLessonsEvent = {
        page: 1,
        limit: 10,
        userId: user.id
      };

      const response = await firstValueFrom(this.lessonClient.send('get-lessons', event));

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
  async getLessonById(@Param('id') id: string, @CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<LessonResponseDto>> {
    this.logger.log(`Getting lesson by ID: ${id} for user: ${user.id}`);

    try {
      const event: GetLessonByIdEvent = {
        id,
        userId: user.id
      };

      const response = await firstValueFrom(this.lessonClient.send('get-lesson-by-id', event));

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
  async getMyProgress(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<any>> {
    this.logger.log(`Getting progress for user: ${user.id}`);

    try {
      const event: GetUserProgressEvent = {
        userId: user.id
      };

      const response = await firstValueFrom(this.lessonClient.send('get-user-progress', event));

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
  async getPublicLessons(): Promise<ApiResponseDto<any>> {
    this.logger.log('Getting public lessons');

    return {
      data: { message: 'Public lessons information' },
      timestamp: new Date().toISOString()
    };
  }
} 