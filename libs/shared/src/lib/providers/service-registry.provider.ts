import { Injectable, Logger } from '@nestjs/common';
import { ServiceRegistry, ServiceInfo, HealthStatus } from '../interfaces';

@Injectable()
export class ServiceRegistryProvider implements ServiceRegistry {
  private readonly logger = new Logger(ServiceRegistryProvider.name);
  private services: Map<string, ServiceInfo> = new Map();

  async register(service: ServiceInfo): Promise<void> {
    this.services.set(service.name, service);
    this.logger.log(`Service registered: ${service.name} at ${service.host}:${service.port}`);
  }

  async deregister(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (service) {
      this.services.delete(serviceName);
      this.logger.log(`Service deregistered: ${serviceName}`);
    }
  }

  async getService(name: string): Promise<ServiceInfo | null> {
    return this.services.get(name) || null;
  }

  async getAllServices(): Promise<ServiceInfo[]> {
    return Array.from(this.services.values());
  }

  async healthCheck(serviceName: string): Promise<HealthStatus> {
    const service = await this.getService(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    // Trong thực tế, sẽ thực hiện HTTP health check đến service
    // Ở đây chỉ trả về health status đã lưu
    return service.health;
  }

  async updateServiceHealth(serviceName: string, health: HealthStatus): Promise<void> {
    const service = this.services.get(serviceName);
    if (service) {
      service.health = health;
      this.services.set(serviceName, service);
      this.logger.log(`Health updated for ${serviceName}: ${health.status}`);
    }
  }

  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  getServiceCount(): number {
    return this.services.size;
  }
} 