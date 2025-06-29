import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Public, BaseController } from '@puchi-be/shared';
import { ClientKafka } from '@nestjs/microservices/client';
import { CLIENT_KAFKA_NAMES } from '@puchi-be/shared';

@Controller()
export class AppController extends BaseController {
  constructor(
    private readonly appService: AppService,
    @Inject(CLIENT_KAFKA_NAMES.LESSON_CLIENT) private readonly lessonClient: ClientKafka,
    @Inject(CLIENT_KAFKA_NAMES.USER_CLIENT) private readonly userClient: ClientKafka,
    @Inject(CLIENT_KAFKA_NAMES.PROGRESS_CLIENT) private readonly progressClient: ClientKafka,
  ) {
    super('ApiGateway', '1.0.0', 8000);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('lesson-service', this.lessonClient);
    this.registerServiceClient('user-service', this.userClient);
    this.registerServiceClient('progress-service', this.progressClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo các tài nguyên cần thiết cho API Gateway
    this.logger.log('API Gateway resources initialized');
  }

  async cleanupResources(): Promise<void> {
    this.logger.log('API Gateway resources cleaned up');
  }

  async registerHealthCheck(): Promise<void> {
    this.logger.log('API Gateway health check registered');
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    this.logger.log('API Gateway deregistered from service registry');
  }

  @Get()
  @Public()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  @Public()
  async getHealth() {
    const health = await super.getHealth();
    return {
      ...health,
      service: 'api-gateway',
      dependencies: {
        lessonService: await this.checkServiceHealth('lesson-service'),
        userService: await this.checkServiceHealth('user-service'),
        progressService: await this.checkServiceHealth('progress-service'),
      }
    };
  }

  // Service status endpoints
  @Get('services/status')
  @Public()
  async getServicesStatus() {
    const services = ['lesson-service', 'user-service', 'progress-service'];
    const status: Record<string, any> = {};

    for (const service of services) {
      try {
        const client = this.getServiceClient(service);
        if (client) {
          status[service] = {
            available: true,
            circuitBreakers: client.getCircuitBreakerState('*')
          };
        } else {
          status[service] = { available: false };
        }
      } catch (error) {
        status[service] = {
          available: false,
          error: error.message
        };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      services: status
    };
  }

  @Get('api-gateway/status')
  @Public()
  async getApiGatewayStatus() {
    return {
      service: 'api-gateway',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        services: '/services/status',
        lessons: '/lessons',
        users: '/users',
        progress: '/progress'
      },
      features: [
        'Circuit Breaker Pattern',
        'Service Discovery',
        'Health Monitoring',
        'Fault Tolerance',
        'Request Routing'
      ]
    };
  }

  private async checkServiceHealth(serviceName: string): Promise<any> {
    try {
      const client = this.getServiceClient(serviceName);
      if (!client) {
        return { status: 'unavailable', error: 'Client not registered' };
      }

      // Thực hiện health check đơn giản
      const circuitBreakerState = client.getCircuitBreakerState('*');
      return {
        status: circuitBreakerState?.status === 'OPEN' ? 'unhealthy' : 'healthy',
        circuitBreaker: circuitBreakerState
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}
