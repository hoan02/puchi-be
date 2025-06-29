import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { createLogger, logUserAction } from '@puchi-be/shared';

@Controller()
export class AppController {
  private readonly logger = createLogger('UserService');

  constructor(private readonly appService: AppService) { }

  @Get()
  getHello() {
    return this.appService.getData();
  }

  @MessagePattern('get-public-info')
  getPublicInfo() {
    this.logger.info('Processing get-public-info request', {
      pattern: 'get-public-info'
    });

    // Public information không cần authentication
    const publicInfo = {
      totalUsers: 1000,
      activeUsers: 750,
      totalLessons: 50,
      completedLessons: 25000,
      systemStatus: 'healthy',
      lastUpdated: new Date().toISOString(),
      features: [
        'vocabulary-learning',
        'grammar-exercises',
        'progress-tracking',
        'achievement-system'
      ]
    };

    this.logger.info('Public info generated successfully', {
      totalUsers: publicInfo.totalUsers,
      activeUsers: publicInfo.activeUsers
    });

    return publicInfo;
  }

  @MessagePattern('get-user-profile')
  getUserProfile(@Payload() data: { userId: string }) {
    this.logger.info('Processing get-user-profile request', {
      userId: data.userId,
      pattern: 'get-user-profile'
    });

    // Dummy data - trả về format đúng với UserAuthPayload
    const profile = {
      id: data.userId,
      email: `user${data.userId}@example.com`,
      firstName: `User`,
      lastName: data.userId,
      profileImageUrl: `https://example.com/avatar/${data.userId}.jpg`,
      username: `user${data.userId}`,
    };

    this.logger.info('User profile generated successfully', {
      userId: data.userId,
      profileId: profile.id,
      data: profile
    });

    logUserAction(this.logger, data.userId, 'profile_generated', {
      service: 'user-service',
      success: true
    });

    return profile;
  }

  @MessagePattern('user-activity')
  async handleUserActivity(@Payload() data: { userId: string; activity: string; lessonId: string; timestamp: string }) {
    this.logger.info('Recording user activity', {
      userId: data.userId,
      activity: data.activity,
      lessonId: data.lessonId,
      timestamp: data.timestamp
    });

    // Ghi lại hoạt động của user
    // Trong thực tế, bạn sẽ lưu vào database
    const result = {
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

    this.logger.info('User activity recorded successfully', {
      userId: data.userId,
      activity: data.activity,
      recordedAt: result.data.recordedAt
    });

    logUserAction(this.logger, data.userId, 'activity_recorded', {
      activity: data.activity,
      lessonId: data.lessonId,
      success: true
    });

    return result;
  }
}
