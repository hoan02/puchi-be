# 🔄 Microservice Communication Architecture

## 📋 Tổng quan

Dự án Puchi Backend sử dụng **hybrid communication pattern**:

- **HTTP/REST**: Client → API Gateway (External communication)
- **Kafka**: API Gateway ↔ Microservices (Internal communication)
- **Kafka Events**: Service-to-Service (Event-driven communication)

## 🏗️ Kiến trúc Communication

### 1. External Communication (HTTP/REST)

```
Client Applications
        │
        ▼ HTTP/REST
┌─────────────────┐
│   API Gateway   │ ← DUY NHẤT có HTTP endpoints
│   (Port 8000)   │
└─────────────────┘
```

**HTTP Endpoints:**

- `GET /api/health` - Health check
- `GET /api/services/status` - Service status
- `GET /api/lessons/*` - Lesson management
- `GET /api/users/*` - User management
- `GET /api/progress/*` - Progress tracking

### 2. Internal Communication (Kafka)

```
API Gateway
        │
        ▼ Kafka
┌─────────────────┐
│   Kafka Broker  │ ← Tất cả services giao tiếp qua đây
│   (Port 9092)   │
└─────────────────┘
        │
        ▼ Kafka
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  User Service   │ │ Lesson Service  │ │ Progress Service│
│  (Kafka Only)   │ │  (Kafka Only)   │ │  (Kafka Only)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🔧 Base Controller Pattern

Tất cả controllers kế thừa từ `BaseController`:

```typescript
export abstract class BaseController implements OnModuleInit, OnModuleDestroy {
  protected serviceClients: Map<string, ServiceClient> = new Map();

  async onModuleInit() {
    await this.initializeServiceClients();
    await this.subscribeReplyTopics();
    await this.registerHealthCheck();
  }

  // Service communication methods
  protected async sendToService(serviceName: string, pattern: string, data: any): Promise<any>;
  protected async emitToService(serviceName: string, pattern: string, data: any): Promise<any>;
}
```

## 📡 Kafka Topics & Patterns

### Request-Response Topics

| Service          | Pattern             | Reply Topic               | Mô tả              |
| ---------------- | ------------------- | ------------------------- | ------------------ |
| User Service     | `get-user-profile`  | `get-user-profile.reply`  | Lấy thông tin user |
| User Service     | `get-public-info`   | `get-public-info.reply`   | Thông tin public   |
| Lesson Service   | `get-lessons`       | `get-lessons.reply`       | Danh sách lessons  |
| Lesson Service   | `get-lesson-by-id`  | `get-lesson-by-id.reply`  | Chi tiết lesson    |
| Progress Service | `get-user-progress` | `get-user-progress.reply` | Tiến độ user       |

### Event Topics

| Event             | Topic             | Publisher    | Subscribers                       |
| ----------------- | ----------------- | ------------ | --------------------------------- |
| `lesson-created`  | `lesson-events`   | API Gateway  | Lesson Service, Analytics Service |
| `user-activity`   | `user-events`     | API Gateway  | User Service, Progress Service    |
| `progress-update` | `progress-events` | Progress Svc | Analytics Service, User Service   |

## 🔧 Cách triển khai

### 1. API Gateway Controller

```typescript
@Controller('lessons')
export class LessonsController extends BaseController {
  constructor(
    @Inject(CLIENT_KAFKA_NAMES.LESSON_CLIENT)
    private readonly lessonClient: ClientKafka,
  ) {
    super('LessonsController', '1.0.0', 8000);
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('lesson-service', this.lessonClient);
  }

  @Get('list')
  async getLessons() {
    // HTTP endpoint → Kafka → Lesson Service
    const lessons = await this.sendToService('lesson-service', 'get-lessons', {});
    return { data: lessons, timestamp: new Date().toISOString() };
  }
}
```

### 2. Microservice (Kafka Only)

```typescript
// apps/lesson-service/src/main.ts
const app = await NestFactory.createMicroservice(AppModule, LESSON_CLIENT_KAFKA_OPTIONS);
await app.listen(); // Chỉ Kafka, không có HTTP server

// apps/lesson-service/src/app/app.controller.ts
@Controller()
export class AppController extends BaseController {
  @MessagePattern('get-lessons')
  async getLessons(data: any) {
    // Xử lý request từ API Gateway
    return { lessons: [] };
  }
}
```

### 3. Service-to-Service Communication

```typescript
// Service A gọi Service B qua Kafka
await this.emitToService('analytics-service', 'lesson-completed', {
  userId: user.id,
  lessonId: lesson.id,
  completedAt: new Date(),
});
```

## 🛡️ Fault Tolerance

### Circuit Breaker States

1. **CLOSED**: Hoạt động bình thường
2. **OPEN**: Ngắt kết nối khi có quá nhiều lỗi
3. **HALF_OPEN**: Thử nghiệm kết nối lại

### Retry Logic

```typescript
const options: ServiceCallOptions = {
  timeout: 10000, // 10 giây timeout
  retries: 3, // Retry 3 lần
  circuitBreaker: true, // Bật circuit breaker
};
```

### Fallback Strategy

```typescript
try {
  const data = await this.sendToService('user-service', 'get-user-profile', event);
  return data;
} catch (error) {
  // Fallback data khi service fail
  return {
    id: user.id,
    email: 'fallback@example.com',
    firstName: 'User',
    lastName: 'Fallback',
  };
}
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- `GET /api/health` - Health status với dependencies
- `GET /api/services/status` - All services status
- `GET /api/circuit-breakers` - Circuit breaker states

### Metrics

- Response time
- Error rate
- Circuit breaker state
- Service availability

## 🧪 Testing

### Test Script

```powershell
# Chạy test communication
.\scripts\test-microservice-communication.ps1
```

### Manual Testing

```bash
# Test API Gateway (HTTP)
curl http://localhost:8000/api/health
curl http://localhost:8000/api/users/public-info
curl http://localhost:8000/api/lessons/public-list
curl http://localhost:8000/api/progress/public-stats

# Test Kafka communication (internal)
# Các services không expose HTTP endpoints
```

## 🔍 Debugging

### Logs

```typescript
// ServiceClient logs
[ServiceClient] [INFO] Sending get-user-profile to user-service (attempt 1/3)
[ServiceClient] [ERROR] Error sending get-user-profile: Connection timeout
[ServiceClient] [WARN] Attempt 1 failed for get-user-profile: Connection timeout
```

### Common Issues

1. **Kafka Connection Failed**

   ```
   Error: Connection to Kafka broker failed
   ```

   **Solution**: Kiểm tra Kafka broker đang chạy

2. **Reply Topic Not Subscribed**

   ```
   Error: The client consumer did not subscribe to the corresponding reply topic
   ```

   **Solution**: Đảm bảo gọi `subscribeToResponseOf()` trong `subscribeServiceReplyTopics()`

3. **Circuit Breaker Open**
   ```
   Error: Circuit breaker is open
   ```
   **Solution**: Đợi circuit breaker reset hoặc kiểm tra service health

## 🚀 Best Practices

### 1. Error Handling

```typescript
try {
  const result = await this.sendToService('service-name', 'pattern', data);
  return result;
} catch (error) {
  this.logger.error('Service call failed', {
    service: 'service-name',
    pattern: 'pattern',
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw error;
}
```

### 2. Timeout Configuration

```typescript
// Short timeout cho health checks
const healthCheckOptions = { timeout: 5000, retries: 1 };

// Longer timeout cho business operations
const businessOptions = { timeout: 15000, retries: 3 };
```

### 3. Circuit Breaker Configuration

```typescript
// Circuit breaker với threshold thấp cho critical services
const criticalServiceOptions = {
  timeout: 10000,
  retries: 2,
  circuitBreaker: true,
};
```

## 📈 Performance Optimization

### 1. Connection Pooling

- Reuse Kafka connections
- Implement connection pooling
- Monitor connection health

### 2. Caching

- Cache frequently accessed data
- Implement distributed caching
- Use cache invalidation strategies

### 3. Load Balancing

- Distribute load across service instances
- Implement health-based routing
- Use sticky sessions when needed

## 🔐 Security

### 1. Authentication

- Validate user tokens tại API Gateway
- Implement service-to-service authentication
- Use secure communication channels

### 2. Authorization

- Check user permissions tại API Gateway
- Implement role-based access control
- Validate service permissions

### 3. Data Protection

- Encrypt sensitive data
- Implement data validation
- Use secure serialization

## 📚 References

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
