# 🚀 Kiến trúc Microservice Hiện đại - Puchi Backend

## 📋 Tổng quan

Dự án Puchi Backend đã được nâng cấp lên kiến trúc microservice hiện đại với các tính năng enterprise-grade:

### 🎯 Tính năng chính

1. **Service Discovery & Health Checks**
2. **Circuit Breaker Pattern**
3. **API Gateway với Routing thông minh**
4. **Event-driven Architecture**
5. **Monitoring & Observability**
6. **Fault Tolerance & Resilience**

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Service Client │    │  Base Controller│
│   (Port 8000)   │◄──►│   (Circuit      │◄──►│  (OnModuleInit) │
│                 │    │    Breaker)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kafka Broker  │    │ Service Registry│    │ Health Checker  │
│   (Port 9092)   │    │   (In-Memory)   │    │   (Monitoring)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Lesson Service │    │  User Service   │    │ Progress Service│
│   (Port 8002)   │    │   (Port 8001)   │    │   (Port 8003)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Các thành phần chính

### 1. Base Controller (`BaseController`)

```typescript
export abstract class BaseController implements OnModuleInit, OnModuleDestroy {
  // Lifecycle hooks
  async onModuleInit(): Promise<void>;
  async onModuleDestroy(): Promise<void>;

  // Health monitoring
  async getHealth(): Promise<HealthStatus>;
  getServiceInfo(): ServiceInfo;

  // Service communication
  protected emitToService(serviceName: string, pattern: string, data: any): Promise<any>;
  protected sendToService(serviceName: string, pattern: string, data: any): Promise<any>;
}
```

**Tính năng:**

- ✅ OnModuleInit/OnModuleDestroy lifecycle
- ✅ Health check tự động
- ✅ Service discovery
- ✅ Circuit breaker integration
- ✅ Logging và monitoring

### 2. Service Client với Circuit Breaker

```typescript
export class ServiceClient {
  async emit<T>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T>;
  async send<T>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T>;

  // Circuit breaker management
  getCircuitBreakerState(pattern: string): CircuitBreakerState;
  resetCircuitBreaker(pattern: string): void;
}
```

**Tính năng:**

- ✅ Circuit breaker pattern (CLOSED/OPEN/HALF_OPEN)
- ✅ Retry mechanism với exponential backoff
- ✅ Timeout handling
- ✅ Error handling và logging

### 3. Health Checker

```typescript
export class HealthChecker {
  async checkHealth(): Promise<HealthStatus>;

  // Monitoring metrics
  getUptime(): number;
  getStartTime(): Date;
}
```

**Metrics được theo dõi:**

- ✅ Memory usage (heap used/total/percentage)
- ✅ CPU usage
- ✅ Service uptime
- ✅ Health status (healthy/unhealthy/degraded)

### 4. Service Registry

```typescript
export class ServiceRegistryProvider implements ServiceRegistry {
  async register(service: ServiceInfo): Promise<void>;
  async deregister(serviceName: string): Promise<void>;
  async getService(name: string): Promise<ServiceInfo | null>;
  async getAllServices(): Promise<ServiceInfo[]>;
  async healthCheck(serviceName: string): Promise<HealthStatus>;
}
```

## 🚀 Cách sử dụng

### 1. Tạo Service mới

```typescript
@Controller()
export class MyServiceController extends BaseController {
  constructor(@Inject(CLIENT_KAFKA_NAMES.OTHER_SERVICE) private readonly otherClient: ClientKafka) {
    super('MyService', '1.0.0', 8009);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('other-service', this.otherClient);
  }

  async initializeResources(): Promise<void> {
    // Khởi tạo database, cache, etc.
  }

  async cleanupResources(): Promise<void> {
    // Cleanup resources
  }

  async registerHealthCheck(): Promise<void> {
    // Register với service registry
  }

  async deregisterFromServiceRegistry(): Promise<void> {
    // Deregister từ service registry
  }
}
```

### 2. Gọi service khác

```typescript
// Emit event (fire-and-forget)
await this.emitToService('user-service', 'user-created', userData, {
  timeout: 5000,
  retries: 3,
});

// Send request (request-response)
const result = await this.sendToService(
  'lesson-service',
  'get-lesson',
  { id },
  {
    timeout: 10000,
    retries: 2,
  },
);
```

### 3. Health Check Endpoints

```bash
# Service health
GET /health

# Service info
GET /info

# Circuit breaker status
GET /circuit-breakers

# All services status (API Gateway)
GET /services/status
```

## 📊 Monitoring & Observability

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 52428800,
    "total": 1073741824,
    "percentage": 4.88
  },
  "cpu": {
    "usage": 2.5
  }
}
```

### Circuit Breaker Status

```json
{
  "lesson-service": {
    "patterns": {
      "get-lesson": {
        "status": "CLOSED",
        "failureCount": 0,
        "successCount": 15,
        "threshold": 5,
        "timeout": 60000
      }
    }
  }
}
```

## 🔄 Event Flow

### 1. Lesson Creation Flow

```
1. API Gateway receives POST /lessons
2. Gateway sends to Lesson Service via Kafka
3. Lesson Service processes and saves to DB
4. Lesson Service emits events to:
   - Progress Service (lesson-available)
   - User Service (user-activity)
5. Services process events asynchronously
```

### 2. Service Communication Patterns

- **Request-Response**: `send()` method
- **Fire-and-Forget**: `emit()` method
- **Event-Driven**: Kafka topics
- **Circuit Breaker**: Automatic failure handling

## 🛡️ Fault Tolerance

### Circuit Breaker States

1. **CLOSED**: Normal operation
2. **OPEN**: Service is failing, requests are blocked
3. **HALF_OPEN**: Testing if service is recovered

### Retry Strategy

- **Exponential Backoff**: 1s, 2s, 4s, 8s...
- **Configurable Timeout**: Default 5s
- **Configurable Retries**: Default 3 attempts

## 📈 Performance Benefits

1. **Resilience**: Circuit breaker prevents cascade failures
2. **Scalability**: Independent service scaling
3. **Observability**: Comprehensive monitoring
4. **Maintainability**: Clear separation of concerns
5. **Reliability**: Automatic retry và error handling

## 🔧 Configuration

### Environment Variables

```bash
# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# Service Configuration
HOST=localhost
PORT=8000

# Circuit Breaker Configuration
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000
```

### Service Call Options

```typescript
interface ServiceCallOptions {
  timeout?: number; // Default: 5000ms
  retries?: number; // Default: 3
  circuitBreaker?: boolean; // Default: true
}
```

## 🚀 Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - '9092:9092'

  api-gateway:
    build: ./apps/api-gateway
    ports:
      - '8000:8000'
    depends_on:
      - kafka

  lesson-service:
    build: ./apps/lesson-service
    ports:
      - '8002:8002'
    depends_on:
      - kafka
```

## 📝 Best Practices

1. **Service Design**
   - Mỗi service có một responsibility rõ ràng
   - Sử dụng BaseController cho consistency
   - Implement proper error handling

2. **Communication**
   - Sử dụng events cho async operations
   - Sử dụng request-response cho sync operations
   - Implement circuit breaker cho tất cả external calls

3. **Monitoring**
   - Monitor health check endpoints
   - Track circuit breaker states
   - Log all service interactions

4. **Testing**
   - Unit tests cho business logic
   - Integration tests cho service communication
   - Load tests cho performance validation

## 🔮 Roadmap

### Phase 1 (Current) ✅

- [x] Base Controller với OnModuleInit
- [x] Circuit Breaker Pattern
- [x] Service Client với retry logic
- [x] Health Check monitoring
- [x] Service Registry (in-memory)

### Phase 2 (Next)

- [ ] Distributed tracing (Jaeger)
- [ ] Metrics collection (Prometheus)
- [ ] Centralized logging (ELK Stack)
- [ ] Service mesh integration (Istio)

### Phase 3 (Future)

- [ ] Auto-scaling
- [ ] Blue-green deployment
- [ ] Chaos engineering
- [ ] Advanced monitoring dashboards

---

**🎉 Chúc mừng! Bạn đã có một kiến trúc microservice hiện đại và robust!**
