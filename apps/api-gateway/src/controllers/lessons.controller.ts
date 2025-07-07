import { Controller, Get, Post, Body, Param, Inject, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AutheliaAuthGuard, CurrentUser, UserAuthPayload, Public } from '@puchi-be/shared';
import { CreateLessonRequestDto, ApiResponseDto, LessonsListResponseDto, LessonResponseDto } from '../dto/lesson.dto';
import { ClientGrpc } from '@nestjs/microservices';

interface LessonServiceGrpc {
  createLesson(data: any): Promise<any>;
  getLessons(data: { userId: string }): Promise<LessonsListResponseDto>;
  getLessonById(data: { id: string, userId: string }): Promise<LessonResponseDto>;
  getMyProgress(data: { userId: string }): Promise<any>;
}

@Controller('lessons')
export class LessonsController {
  private lessonServiceGrpc: LessonServiceGrpc;

  constructor(
    @Inject('LESSON_SERVICE') private readonly lessonClient: ClientGrpc
  ) {
    this.lessonServiceGrpc = this.lessonClient.getService<LessonServiceGrpc>('LessonService');
  }

  @Post()
  @UseGuards(AutheliaAuthGuard)
  async createLesson(@Body() createLessonDto: CreateLessonRequestDto, @CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<any>> {
    try {
      const result = await this.lessonServiceGrpc.createLesson({ ...createLessonDto, createdBy: user.id });
      return {
        data: { lesson: result },
        message: "Lesson creation initiated",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  @UseGuards(AutheliaAuthGuard)
  async getLessons(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<LessonsListResponseDto>> {
    try {
      const response = await this.lessonServiceGrpc.getLessons({ userId: user.id });
      return {
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @UseGuards(AutheliaAuthGuard)
  async getLessonById(@Param('id') id: string, @CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<LessonResponseDto>> {
    try {
      const response = await this.lessonServiceGrpc.getLessonById({ id, userId: user.id });
      return {
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('my-progress')
  @UseGuards(AutheliaAuthGuard)
  async getMyProgress(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<any>> {
    try {
      const response = await this.lessonServiceGrpc.getMyProgress({ userId: user.id });
      return {
        data: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 