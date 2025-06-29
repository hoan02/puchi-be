import { HealthStatus } from '../interfaces/service-discovery.interface';
import { createLogger } from './logger.utils';

export class HealthChecker {
  private readonly logger = createLogger('HealthChecker');
  private startTime: Date = new Date();

  async checkHealth(): Promise<HealthStatus> {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      // Tính toán CPU usage (đơn giản)
      const cpuUsage = this.calculateCpuUsage();

      const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      const status: HealthStatus = {
        status: this.determineHealthStatus(memoryPercentage, cpuUsage),
        timestamp: new Date(),
        uptime,
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: memoryPercentage,
        },
        cpu: {
          usage: cpuUsage,
        },
      };

      this.logger.info(`Health check completed: ${status.status}`);
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Health check failed', { error: errorMessage });
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        cpu: {
          usage: 0,
        },
      };
    }
  }

  private calculateCpuUsage(): number {
    // Đơn giản hóa - trong thực tế có thể sử dụng thư viện như 'cpu-usage'
    const startUsage = process.cpuUsage();

    // Simulate CPU usage calculation
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }

    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;

    // Convert to percentage (approximate)
    return Math.min(totalUsage / 1000000, 100);
  }

  private determineHealthStatus(memoryPercentage: number, cpuUsage: number): 'healthy' | 'unhealthy' | 'degraded' {
    if (memoryPercentage > 90 || cpuUsage > 90) {
      return 'unhealthy';
    }

    if (memoryPercentage > 70 || cpuUsage > 70) {
      return 'degraded';
    }

    return 'healthy';
  }

  getUptime(): number {
    return process.uptime();
  }

  getStartTime(): Date {
    return this.startTime;
  }
} 