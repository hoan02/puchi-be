# 🔄 Microservice Communication Architecture

## Tổng quan

Dự án Puchi Backend sử dụng kiến trúc microservice với Kafka làm message broker. Các service giao tiếp với nhau thông qua:

- **Request-Response Pattern**: Sử dụng `send()` với reply topics
- **Event-Driven Pattern**: Sử dụng `emit()` cho async communication
- **Circuit Breaker Pattern**: Đảm bảo fault tolerance
- **Service Discovery**: Tự động khám phá và kết nối services

## 🏗️ Kiến trúc Communication

### 1. Base Controller Pattern

Tất cả controllers kế thừa từ `BaseController` để có các tính năng:

```typescript
export abstract class BaseController implements OnModuleInit, OnModuleDestroy {
  protected serviceClients: Map<string, ServiceClient> = new Map();

  async onModuleInit() {
    await this.initializeServiceClients();
    await this.subscribeReplyTopics(); // 🔑 Quan trọng!
    await this.registerHealthCheck();
  }

  protected async subscribeReplyTopics(): Promise<void> {
    // Subscribe reply topics cho tất cả service clients
  }
}
```

### 2. Service Client với Circuit Breaker

```typescript
export class ServiceClient {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  async send<T = any>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T> {
    // Circuit breaker pattern với retry logic
  }

  async emit<T = any>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T> {
    // Event-driven communication
  }
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

| Event            | Topic            | Publisher   | Subscribers                       |
| ---------------- | ---------------- | ----------- | --------------------------------- |
| `lesson-created` | `lesson-created` | API Gateway | Lesson Service, Analytics Service |
| `user-activity`  | `user-activity`  | API Gateway | User Service, Progress Service    |

## 🔧 Cách triển khai

### 1. Khởi tạo Service Client

```typescript
@Controller('users')
export class UsersController extends BaseController {
  constructor(
    @Inject(CLIENT_KAFKA_NAMES.USER_CLIENT)
    private readonly userClient: ClientKafka,
  ) {
    super('UsersController');
  }

  async initializeServiceClients(): Promise<void> {
    this.registerServiceClient('user-service', this.userClient);
  }
}
```

### 2. Subscribe Reply Topics

```typescript
protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
  if (serviceName === 'user-service') {
    // Subscribe reply topics cho user service
    client.subscribeToResponseOf('get-user-profile');
    client.subscribeToResponseOf('get-public-info');
    await client.connect();
  }
}
```

### 3. Gọi Service

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: UserAuthPayload) {
  const event: GetUserProfileEvent = { userId: user.id };

  // Sử dụng ServiceClient với circuit breaker
  const profile = await this.sendToService('user-service', 'get-user-profile', event, {
    timeout: 10000,
    retries: 2
  });

  return { data: profile, timestamp: new Date().toISOString() };
}
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
  // Fallback data
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

- `GET /health` - Health status
- `GET /info` - Service information
- `GET /circuit-breakers` - Circuit breaker states

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
# Test health check
curl http://localhost:8000/health

# Test user service
curl http://localhost:8000/users/public-info

# Test lesson service
curl http://localhost:8000/lessons/public-list

# Test progress service
curl http://localhost:8000/progress/public-stats
```

## 🔍 Debugging

### Logs

```typescript
// ServiceClient logs
[ServiceClient] [INFO] Sending get-user-profile to user-service (attempt 1/2)
[ServiceClient] [ERROR] Error sending get-user-profile: Connection timeout
[ServiceClient] [WARN] Attempt 1 failed for get-user-profile: Connection timeout
```

### Common Issues

1. **Reply Topic Not Subscribed**

   ```
   Error: The client consumer did not subscribe to the corresponding reply topic
   ```

   **Solution**: Đảm bảo gọi `subscribeToResponseOf()` trong `subscribeServiceReplyTopics()`

2. **Kafka Connection Failed**

   ```
   Error: Connection to Kafka broker failed
   ```

   **Solution**: Kiểm tra Kafka broker đang chạy

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

### 4. Logging

```typescript
// Structured logging
this.logger.log('Service call initiated', {
  service: 'user-service',
  pattern: 'get-user-profile',
  userId: user.id,
  timestamp: new Date().toISOString(),
});
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

- Validate user tokens
- Implement service-to-service authentication
- Use secure communication channels

### 2. Authorization

- Check user permissions
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
- [Service Discovery](https://microservices.io/patterns/service-registry.html)
