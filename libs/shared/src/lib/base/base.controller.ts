import {
  OnModuleInit,
  OnModuleDestroy,
  Get,
  Logger,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices/client';
import { HealthChecker, ServiceClient } from '../utils';
import { HealthStatus, ServiceInfo } from '../interfaces';

export abstract class BaseController implements OnModuleInit, OnModuleDestroy {
  protected readonly logger: Logger;
  protected readonly healthChecker: HealthChecker;
  protected serviceClients: Map<string, ServiceClient> = new Map();
  protected serviceInfo: ServiceInfo;

  constructor(
    protected readonly serviceName: string,
    protected readonly version = '1.0.0',
    protected readonly port = 8000
  ) {
    this.logger = new Logger(serviceName);
    this.healthChecker = new HealthChecker();
    this.serviceInfo = {
      name: serviceName,
      version,
      host: process.env['HOST'] || 'localhost',
      port,
      health: {
        status: 'healthy',
        timestamp: new Date(),
        uptime: 0,
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 }
      }
    };
  }

  async onModuleInit() {
    this.logger.log(`🚀 ${this.serviceName} is initializing...`);

    try {
      // Khởi tạo service clients
      await this.initializeServiceClients();

      // Subscribe reply topics
      await this.subscribeReplyTopics();

      // Đăng ký health check
      await this.registerHealthCheck();

      // Khởi tạo các tài nguyên khác
      await this.initializeResources();

      this.logger.log(`✅ ${this.serviceName} initialized successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Failed to initialize ${this.serviceName}: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log(`🛑 ${this.serviceName} is shutting down...`);

    try {
      // Cleanup resources
      await this.cleanupResources();

      // Deregister from service registry
      await this.deregisterFromServiceRegistry();

      this.logger.log(`✅ ${this.serviceName} shutdown completed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Error during shutdown: ${errorMessage}`, errorStack);
    }
  }

  @Get('health')
  async getHealth(): Promise<HealthStatus> {
    const health = await this.healthChecker.checkHealth();
    this.serviceInfo.health = health;
    return health;
  }

  @Get('info')
  getServiceInfo(): ServiceInfo {
    return this.serviceInfo;
  }

  @Get('circuit-breakers')
  getCircuitBreakerStatus() {
    const status: Record<string, any> = {};

    for (const [serviceName, client] of this.serviceClients.entries()) {
      status[serviceName] = {
        patterns: client.getCircuitBreakerState('*')
      };
    }

    return status;
  }

  protected abstract initializeServiceClients(): Promise<void>;
  protected abstract initializeResources(): Promise<void>;
  protected abstract cleanupResources(): Promise<void>;
  protected abstract registerHealthCheck(): Promise<void>;
  protected abstract deregisterFromServiceRegistry(): Promise<void>;

  protected registerServiceClient(name: string, client: ClientKafka): void {
    this.serviceClients.set(name, new ServiceClient(client, name));
    this.logger.log(`Registered service client: ${name}`);
  }

  protected getServiceClient(name: string): ServiceClient | undefined {
    return this.serviceClients.get(name);
  }

  protected async subscribeReplyTopics(): Promise<void> {
    // Subscribe reply topics cho tất cả service clients
    for (const [serviceName, client] of this.serviceClients.entries()) {
      const kafkaClient = client.getKafkaClient();
      if (kafkaClient) {
        // Subscribe các reply topics cần thiết
        await this.subscribeServiceReplyTopics(serviceName, kafkaClient);
      }
    }
  }

  protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
    // Override method này trong các controller con để subscribe specific reply topics
    this.logger.log(`No specific reply topics to subscribe for ${serviceName}`);
  }

  protected async emitToService(
    serviceName: string,
    pattern: string,
    data: any,
    options?: any
  ): Promise<any> {
    const client = this.getServiceClient(serviceName);
    if (!client) {
      throw new Error(`Service client ${serviceName} not found`);
    }

    return client.emit(pattern, data, options);
  }

  protected async sendToService(
    serviceName: string,
    pattern: string,
    data: any,
    options?: any
  ): Promise<any> {
    const client = this.getServiceClient(serviceName);
    if (!client) {
      throw new Error(`Service client ${serviceName} not found`);
    }

    return client.send(pattern, data, options);
  }
} 