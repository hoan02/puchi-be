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
import { ClientKafka } from '@nestjs/microservices/client';

@Controller('progress')
export class ProgressController extends BaseController {
  constructor(
    @Inject(CLIENT_KAFKA_NAMES.PROGRESS_CLIENT)
    private readonly progressClient: ClientKafka
  ) {
    super('ProgressController', '1.0.0', 8000);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('progress-service', this.progressClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo các tài nguyên cần thiết
    this.logger.log('Progress controller resources initialized');
  }

  async cleanupResources(): Promise<void> {
    this.logger.log('Progress controller resources cleaned up');
  }

  async registerHealthCheck(): Promise<void> {
    this.logger.log('Progress controller health check registered');
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    this.logger.log('Progress controller deregistered from service registry');
  }

  protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
    if (serviceName === 'progress-service') {
      // Subscribe reply topics cho progress service
      client.subscribeToResponseOf('get-user-progress');
      await client.connect();
      this.logger.log(`Subscribed to reply topics for ${serviceName}`);
    }
  }

  @Get('user-progress')
  @UseGuards(ClerkAuthGuard)
  async getUserProgress(@CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting progress for user: ${user.id}`);

    try {
      // Sử dụng ServiceClient với circuit breaker
      const progress = await this.sendToService('progress-service', 'get-user-progress', {
        userId: user.id
      }, {
        timeout: 10000,
        retries: 2
      });

      this.logger.log(`Retrieved progress for user: ${user.id}`);

      return {
        data: progress,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error fetching user progress: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  @Get('public-stats')
  @Public()
  async getPublicStats() {
    this.logger.log('Getting public progress stats');

    return {
      message: 'Public progress statistics',
      timestamp: new Date().toISOString()
    };
  }
} 