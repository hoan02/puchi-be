export interface ServiceInfo {
  name: string;
  version: string;
  host: string;
  port: number;
  health: HealthStatus;
  metadata?: Record<string, any>;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

export interface ServiceRegistry {
  register(service: ServiceInfo): Promise<void>;
  deregister(serviceName: string): Promise<void>;
  getService(name: string): Promise<ServiceInfo | null>;
  getAllServices(): Promise<ServiceInfo[]>;
  healthCheck(serviceName: string): Promise<HealthStatus>;
}

export interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  successCount: number;
  threshold: number;
  timeout: number;
} 