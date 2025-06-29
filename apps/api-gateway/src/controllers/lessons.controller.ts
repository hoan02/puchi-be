import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Param, UseGuards } from '@nestjs/common';
import {
  ClerkAuthGuard,
  CurrentUser,
  UserAuthPayload,
  Public,
  CLIENT_KAFKA_NAMES,
  BaseController,
} from '@puchi-be/shared';
import { CreateLessonRequestDto, ApiResponseDto, LessonsListResponseDto, LessonResponseDto } from '../dto/lesson.dto';
import { GetLessonsEvent, GetLessonByIdEvent, GetUserProgressEvent } from '../events/lesson.events';
import { LessonCreatedEvent } from '@puchi-be/shared';
import { ClientKafka } from '@nestjs/microservices/client';

@Controller('lessons')
export class LessonsController extends BaseController {
  constructor(
    @Inject(CLIENT_KAFKA_NAMES.LESSON_CLIENT)
    private readonly lessonClient: ClientKafka
  ) {
    super('LessonsController', '1.0.0', 8000);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('lesson-service', this.lessonClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo các tài nguyên cần thiết
    this.logger.log('Lessons controller resources initialized');
  }

  async cleanupResources(): Promise<void> {
    this.logger.log('Lessons controller resources cleaned up');
  }

  async registerHealthCheck(): Promise<void> {
    this.logger.log('Lessons controller health check registered');
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    this.logger.log('Lessons controller deregistered from service registry');
  }

  protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
    if (serviceName === 'lesson-service') {
      // Subscribe reply topics cho lesson service
      client.subscribeToResponseOf('get-lessons');
      client.subscribeToResponseOf('get-lesson-by-id');
      client.subscribeToResponseOf('get-user-progress');
      await client.connect();
      this.logger.log(`Subscribed to reply topics for ${serviceName}`);
    }
  }

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

      // Sử dụng ServiceClient với circuit breaker
      await this.sendToService('lesson-service', 'lesson-created', event.toString(), {
        timeout: 15000,
        retries: 3
      });

      this.logger.log(`Lesson created successfully: ${createLessonDto.title}`);

      return {
        data: { lesson: createLessonDto },
        message: "Lesson creation initiated",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error creating lesson: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
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

      // Sử dụng ServiceClient với circuit breaker
      const response = await this.sendToService('lesson-service', 'get-lessons', event, {
        timeout: 10000,
        retries: 2
      });

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
      this.logger.error(`Error fetching lessons: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
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

      // Sử dụng ServiceClient với circuit breaker
      const response = await this.sendToService('lesson-service', 'get-lesson-by-id', event, {
        timeout: 10000,
        retries: 2
      });

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
      this.logger.error(`Error fetching lesson: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
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

      // Sử dụng ServiceClient với circuit breaker
      const response = await this.sendToService('lesson-service', 'get-user-progress', event, {
        timeout: 10000,
        retries: 2
      });

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
      this.logger.error(`Error fetching user progress: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
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