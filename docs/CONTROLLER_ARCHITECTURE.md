# 🏗️ Kiến trúc Controller - API Gateway

## 📋 Tổng quan

API Gateway đã được tổ chức lại theo kiến trúc modular với các controller riêng biệt, mỗi controller kế thừa từ `BaseController` và sử dụng `ServiceClient` với circuit breaker pattern.

## 🗂️ Cấu trúc thư mục

```
apps/api-gateway/src/
├── app/
│   ├── app.controller.ts      # Main controller (health, status)
│   ├── app.service.ts
│   └── app.module.ts
├── controllers/               # Feature-based controllers
│   ├── lessons.controller.ts  # Lesson-related endpoints
│   ├── users.controller.ts    # User-related endpoints
│   └── progress.controller.ts # Progress-related endpoints
├── dto/
│   └── lesson.dto.ts
└── events/
    ├── lesson.events.ts
    └── user.events.ts
```

## 🔧 Các Controller

### 1. **AppController** (Main Controller)

**File:** `apps/api-gateway/src/app/app.controller.ts`

**Responsibility:**

- Health check và monitoring
- Service status overview
- API Gateway status

**Endpoints:**

```typescript
GET /                    # Basic info
GET /health             # Health check với dependencies
GET /services/status    # All services status
GET /api-gateway/status # API Gateway detailed status
```

**Features:**

- ✅ Extends BaseController
- ✅ Service client management
- ✅ Health monitoring
- ✅ Circuit breaker status

### 2. **LessonsController**

**File:** `apps/api-gateway/src/controllers/lessons.controller.ts`

**Responsibility:**

- Lesson management
- Lesson creation và retrieval
- User progress tracking

**Endpoints:**

```typescript
POST /lessons           # Create lesson
GET /lessons/list       # Get lessons list
GET /lessons/:id        # Get lesson by ID
GET /lessons/my-progress # Get user progress
GET /lessons/public-list # Public lessons
```

**Features:**

- ✅ Extends BaseController
- ✅ Circuit breaker integration
- ✅ Error handling
- ✅ Authentication guards

### 3. **UsersController**

**File:** `apps/api-gateway/src/controllers/users.controller.ts`

**Responsibility:**

- User profile management
- Public user information
- User activity tracking

**Endpoints:**

```typescript
GET /users/profile      # Get user profile
GET /users/public-info  # Get public user info
```

**Features:**

- ✅ Extends BaseController
- ✅ Circuit breaker với fallback
- ✅ Performance monitoring
- ✅ Error logging

### 4. **ProgressController**

**File:** `apps/api-gateway/src/controllers/progress.controller.ts`

**Responsibility:**

- Progress tracking
- User progress retrieval
- Public statistics

**Endpoints:**

```typescript
GET /progress/user-progress # Get user progress
GET /progress/public-stats  # Get public stats
```

**Features:**

- ✅ Extends BaseController
- ✅ Circuit breaker integration
- ✅ Error handling
- ✅ Authentication guards

## 🚀 Kiến trúc BaseController

### Lifecycle Methods

```typescript
export abstract class BaseController implements OnModuleInit, OnModuleDestroy {
  // Lifecycle hooks
  async onModuleInit(): Promise<void>;
  async onModuleDestroy(): Promise<void>;

  // Abstract methods to implement
  protected abstract initializeServiceClients(): Promise<void>;
  protected abstract initializeResources(): Promise<void>;
  protected abstract cleanupResources(): Promise<void>;
  protected abstract registerHealthCheck(): Promise<void>;
  protected abstract deregisterFromServiceRegistry(): Promise<void>;
}
```

### Service Communication

```typescript
// Emit event (fire-and-forget)
await this.emitToService('service-name', 'pattern', data, options);

// Send request (request-response)
const result = await this.sendToService('service-name', 'pattern', data, options);
```

### Health Monitoring

```typescript
// Health check endpoint
@Get('health')
async getHealth(): Promise<HealthStatus>

// Service info endpoint
@Get('info')
getServiceInfo(): ServiceInfo

// Circuit breaker status
@Get('circuit-breakers')
getCircuitBreakerStatus()
```

## 🔄 Service Communication Pattern

### 1. **Request-Response Pattern**

```typescript
// Sử dụng sendToService cho request-response
const response = await this.sendToService(
  'lesson-service',
  'get-lesson-by-id',
  {
    id: lessonId,
    userId: user.id,
  },
  {
    timeout: 10000,
    retries: 2,
  },
);
```

### 2. **Event-Driven Pattern**

```typescript
// Sử dụng emitToService cho fire-and-forget events
await this.emitToService('lesson-service', 'lesson-created', eventData, {
  timeout: 15000,
  retries: 3,
});
```

### 3. **Circuit Breaker Integration**

```typescript
// Tự động circuit breaker với configurable options
const result = await this.sendToService('user-service', 'get-user-profile', data, {
  timeout: 10000,
  retries: 2,
  circuitBreaker: true, // Default: true
});
```

## 🛡️ Fault Tolerance

### Circuit Breaker States

- **CLOSED**: Normal operation
- **OPEN**: Service is failing, requests blocked
- **HALF_OPEN**: Testing if service recovered

### Retry Strategy

- **Exponential Backoff**: 1s, 2s, 4s, 8s...
- **Configurable Timeout**: Default 5s
- **Configurable Retries**: Default 3 attempts

### Error Handling

```typescript
try {
  const result = await this.sendToService('service-name', 'pattern', data, options);
  return result;
} catch (error) {
  this.logger.error(`Error: ${error.message}`, error.stack);
  // Handle error appropriately
  throw new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
}
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
  },
  "service": "api-gateway",
  "dependencies": {
    "lessonService": { "status": "healthy" },
    "userService": { "status": "healthy" },
    "progressService": { "status": "healthy" }
  }
}
```

### Service Status Response

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "lesson-service": {
      "available": true,
      "circuitBreakers": {
        "get-lesson": {
          "status": "CLOSED",
          "failureCount": 0,
          "successCount": 15
        }
      }
    }
  }
}
```

## 🔧 Configuration

### Module Configuration

```typescript
@Module({
  imports: [ClientsModule.register([API_GATEWAY_CLIENT_KAFKA_MODULE, LESSON_CLIENT_KAFKA_MODULE, USER_CLIENT_KAFKA_MODULE, PROGRESS_CLIENT_KAFKA_MODULE])],
  controllers: [AppController, UsersController, LessonsController, ProgressController],
})
export class AppModule {}
```

### Service Call Options

```typescript
interface ServiceCallOptions {
  timeout?: number; // Default: 5000ms
  retries?: number; // Default: 3
  circuitBreaker?: boolean; // Default: true
}
```

## 🎯 Best Practices

### 1. **Controller Design**

- Mỗi controller có một responsibility rõ ràng
- Kế thừa từ BaseController cho consistency
- Implement proper error handling

### 2. **Service Communication**

- Sử dụng `sendToService` cho request-response
- Sử dụng `emitToService` cho events
- Configure appropriate timeouts và retries

### 3. **Error Handling**

- Catch và log errors appropriately
- Provide meaningful error messages
- Use HTTP status codes correctly

### 4. **Monitoring**

- Monitor health check endpoints
- Track circuit breaker states
- Log all service interactions

## 🚀 Deployment

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

### Health Check Endpoints

```bash
# API Gateway Health
curl http://localhost:8000/health

# Service Status
curl http://localhost:8000/services/status

# API Gateway Status
curl http://localhost:8000/api-gateway/status
```

## 📈 Benefits

1. **Modularity**: Mỗi controller có responsibility riêng biệt
2. **Maintainability**: Code dễ maintain và extend
3. **Scalability**: Có thể scale từng controller độc lập
4. **Fault Tolerance**: Circuit breaker pattern
5. **Observability**: Comprehensive monitoring
6. **Consistency**: Tất cả controller kế thừa từ BaseController

---

**🎉 Kiến trúc controller đã được tổ chức lại một cách modular và robust!**
