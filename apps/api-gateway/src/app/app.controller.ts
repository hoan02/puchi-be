import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Query, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { LESSON_SERVICE_RABBITMQ } from '../constants';
import { CreateLessonDto, LessonResponseDto } from '@puchi-be/shared';

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
  async createLesson(@Body() lesson: CreateLessonDto) {
    try {
      // Validate lesson data
      if (!lesson.title || !lesson.durationMinutes) {
        throw new HttpException('Invalid lesson data', HttpStatus.BAD_REQUEST);
      }

      // Emit event with error handling
      await this.client.emit("lesson-created", lesson).toPromise();

      return {
        message: "Lesson sent to RabbitMQ successfully",
        lesson,
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
  async getLessons(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    try {
      const response = await this.client.send('get-lessons', {
        page: parseInt(page),
        limit: parseInt(limit)
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
  async getLessonById(@Param('id') id: string) {
    try {
      const lesson = await this.client.send('get-lesson-by-id', { id }).toPromise();

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
}
