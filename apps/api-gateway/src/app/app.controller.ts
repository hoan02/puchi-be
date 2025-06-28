import { Body, Controller, Get, Inject, Post, HttpException, HttpStatus, Query, Param, Headers, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { LESSON_SERVICE_RABBITMQ } from '../constants';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public } from '@puchi-be/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(LESSON_SERVICE_RABBITMQ) private readonly client: ClientProxy
  ) { }

  @Get()
  @Public()
  getData() {
    return this.appService.getData();
  }

  @Post("lesson")
  @UseGuards(ClerkAuthGuard)
  async createLesson(@Body() lesson: any, @CurrentUser() user: UserAuthPayload) {
    try {
      // Forward request with user info to lesson service via RabbitMQ
      await this.client.emit("lesson-created", {
        lesson,
        user: { id: user.userId, email: user.username }
      }).toPromise();

      return {
        message: "Lesson request sent to lesson service",
        lesson,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error forwarding lesson request:', error);
      throw new HttpException(
        'Failed to process lesson request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("lessons")
  @UseGuards(ClerkAuthGuard)
  async getLessons(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @CurrentUser() user: UserAuthPayload
  ) {
    try {
      const response = await this.client.send('get-lessons', {
        page: parseInt(page),
        limit: parseInt(limit),
        user: { id: user.userId }
      }).toPromise();

      if (!response.success) {
        throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
      }

      return {
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching lessons:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch lessons',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("lesson/:id")
  @UseGuards(ClerkAuthGuard)
  async getLessonById(@Param('id') id: string, @CurrentUser() user: UserAuthPayload) {
    try {
      const response = await this.client.send('get-lesson-by-id', {
        id,
        user: { id: user.userId }
      }).toPromise();

      if (!response.success) {
        throw new HttpException(response.error, HttpStatus.NOT_FOUND);
      }

      return {
        data: response.data,
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
  @UseGuards(ClerkAuthGuard)
  async getMyProgress(@CurrentUser() user: UserAuthPayload) {
    try {
      const response = await this.client.send('get-user-progress', {
        user: { id: user.userId }
      }).toPromise();

      if (!response.success) {
        throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
      }

      return {
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user progress',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
