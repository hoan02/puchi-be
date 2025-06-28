import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
   @MessagePattern('get-user-profile')
  getUserProfile(@Payload() data: { userId: string }) {
    console.log('data', data);
    // Dummy data - trả về format đúng với UserAuthPayload

    return {
      id: data.userId,
      email: `user${data.userId}@example.com`,
      firstName: `User`,
      lastName: data.userId,
      profileImageUrl: `https://example.com/avatar/${data.userId}.jpg`,
      username: `user${data.userId}`,
    };
  }

  @MessagePattern('user-activity')
  async handleUserActivity(@Payload() data: { userId: string; activity: string; lessonId: string; timestamp: string }) {
    console.log(`User service: Recording activity ${data.activity} for user ${data.userId}`);

    // Ghi lại hoạt động của user
    // Trong thực tế, bạn sẽ lưu vào database
    return {
      success: true,
      message: `Activity recorded: ${data.activity}`,
      data: {
        userId: data.userId,
        activity: data.activity,
        lessonId: data.lessonId,
        timestamp: data.timestamp,
        recordedAt: new Date().toISOString()
      }
    };
  }
}
