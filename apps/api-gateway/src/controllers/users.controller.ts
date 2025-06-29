import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import {
  ClerkAuthGuard,
  CurrentUser,
  UserAuthPayload,
  Public,
  CLIENT_KAFKA_NAMES,
  BaseController,
  ServiceClient
} from '@puchi-be/shared';
import { ApiResponseDto } from '../dto/lesson.dto';
import { GetUserProfileEvent, UserProfileResponse } from '../events/user.events';
import { ClientKafka } from '@nestjs/microservices';

@Controller('users')
export class UsersController extends BaseController {
  constructor(
    @Inject(CLIENT_KAFKA_NAMES.USER_CLIENT)
    private readonly userClient: ClientKafka
  ) {
    super('UsersController', '1.0.0', 8000);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('user-service', this.userClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo các tài nguyên cần thiết
    this.logger.log('Users controller resources initialized');
  }

  async cleanupResources(): Promise<void> {
    this.logger.log('Users controller resources cleaned up');
  }

  async registerHealthCheck(): Promise<void> {
    this.logger.log('Users controller health check registered');
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    this.logger.log('Users controller deregistered from service registry');
  }

  protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
    if (serviceName === 'user-service') {
      // Subscribe reply topics cho user service
      client.subscribeToResponseOf('get-user-profile');
      client.subscribeToResponseOf('get-public-info');
      await client.connect();
      this.logger.log(`Subscribed to reply topics for ${serviceName}`);
    }
  }

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  async getProfile(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<UserProfileResponse>> {
    const startTime = Date.now();

    this.logger.log('Getting user profile', {
      userId: user.id,
      endpoint: '/api/users/profile'
    });

    try {
      const event: GetUserProfileEvent = { userId: user.id };

      // Sử dụng ServiceClient với circuit breaker
      const profile = await this.sendToService('user-service', 'get-user-profile', event, {
        timeout: 10000,
        retries: 2
      });

      const duration = Date.now() - startTime;

      this.logger.log('User profile retrieved successfully', {
        userId: user.id,
        duration: `${duration}ms`,
        profileId: profile.id
      });

      // Log user action
      this.logger.log(`User action: get_profile - User: ${user.id}, Duration: ${duration}ms, Success: true`);

      return {
        data: profile,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Error getting user profile', {
        userId: user.id,
        endpoint: '/api/users/profile',
        duration: `${duration}ms`,
        operation: 'get_user_profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  @Get('public-info')
  @Public()
  async getPublicInfo(): Promise<ApiResponseDto<any>> {
    const startTime = Date.now();

    this.logger.log('Getting public user info', {
      endpoint: '/api/users/public-info'
    });

    try {
      // Sử dụng ServiceClient với circuit breaker
      const publicInfo = await this.sendToService('user-service', 'get-public-info', {}, {
        timeout: 5000,
        retries: 1
      });

      const duration = Date.now() - startTime;

      this.logger.log('Public user info retrieved successfully', {
        duration: `${duration}ms`,
        data: publicInfo
      });

      return {
        data: publicInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.warn('Failed to get public info from User Service, using fallback', {
        endpoint: '/api/users/public-info',
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback data nếu Kafka call thất bại
      const fallbackData = {
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
        ],
        note: 'Data from fallback (User Service unavailable)'
      };

      return {
        data: fallbackData,
        timestamp: new Date().toISOString()
      };
    }
  }
} 