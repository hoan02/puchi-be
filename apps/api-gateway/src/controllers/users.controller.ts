import { Controller, Get, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public } from '@puchi-be/shared';
import { ApiResponseDto } from '../dto/lesson.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcMethod } from '@nestjs/microservices';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface UserServiceGrpc {
  getUserProfile(data: { userId: string }): any;
  getPublicInfo(data: object): any;
}

@Controller('users')
export class UsersController implements OnModuleInit {
  private userServiceGrpc: UserServiceGrpc;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.userServiceGrpc = this.userClient.getService<UserServiceGrpc>('UserService');
  }

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  async getProfile(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<any>> {
    const profile = await firstValueFrom(this.userServiceGrpc.getUserProfile({ userId: user.id }));
    return {
      data: profile,
      timestamp: new Date().toISOString()
    };
  }

  @Get('public-info')
  @Public()
  async getPublicInfo(): Promise<ApiResponseDto<any>> {
    const publicInfo = await firstValueFrom(this.userServiceGrpc.getPublicInfo({}));
    return {
      data: publicInfo,
      timestamp: new Date().toISOString()
    };
  }

  @GrpcMethod('UserService', 'GetUser')
  getUser(data: { userId: string }) {
    // Lấy user từ DB, ví dụ trả về cứng
    return { userId: data.userId, name: 'User Name', email: 'user@email.com' };
  }
}

@Controller()
export class NotificationController {
  @MessagePattern('lesson.completed')
  async handleLessonCompleted(@Payload() data: any) {
    const { userId, lessonId } = data.value || data;
    // Gửi thông báo cho user ở đây
    console.log(`Gửi thông báo cho user ${userId} về bài học ${lessonId}`);
  }
} 