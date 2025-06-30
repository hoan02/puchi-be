# 🏗️ Kiến trúc Controller - API Gateway

## 📋 Tổng quan

API Gateway đã được tổ chức theo kiến trúc **HTTP Server + Kafka Producer** với các controller riêng biệt, mỗi controller kế thừa từ `BaseController` và sử dụng `ServiceClient` với circuit breaker pattern.

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
GET /api/                    # Basic info
GET /api/health             # Health check với dependencies
GET /api/services/status    # All services status
GET /api/api-gateway/status # API Gateway detailed status
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
POST /api/lessons           # Create lesson
GET /api/lessons/list       # Get lessons list
GET /api/lessons/:id        # Get lesson by ID
GET /api/lessons/my-progress # Get user progress
GET /api/lessons/public-list # Public lessons
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
GET /api/users/profile      # Get user profile
GET /api/users/public-info  # Get public user info
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
GET /api/progress/user-progress # Get user progress
GET /api/progress/public-stats  # Get public stats
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

## 📡 Kafka Integration

### Service Client Registration

```typescript
async initializeServiceClients(): Promise<void> {
  this.registerServiceClient('lesson-service', this.lessonClient);
  this.registerServiceClient('user-service', this.userClient);
  this.registerServiceClient('progress-service', this.progressClient);
}
```

### Reply Topic Subscription

```typescript
protected async subscribeServiceReplyTopics(serviceName: string, client: ClientKafka): Promise<void> {
  if (serviceName === 'lesson-service') {
    client.subscribeToResponseOf('get-lessons');
    client.subscribeToResponseOf('get-lesson-by-id');
    await client.connect();
  }
}
```

## 🛡️ Circuit Breaker Integration

### Circuit Breaker States

1. **CLOSED**: Normal operation
2. **OPEN**: Service is failing, requests are blocked
3. **HALF_OPEN**: Testing if service is recovered

### Configuration

```typescript
const options: ServiceCallOptions = {
  timeout: 10000, // 10 seconds
  retries: 3, // Retry 3 times
  circuitBreaker: true, // Enable circuit breaker
};
```

## 📊 Monitoring & Observability

### Health Check Response

```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "dependencies": {
    "lessonService": { "status": "healthy" },
    "userService": { "status": "healthy" },
    "progressService": { "status": "healthy" }
  }
}
```

### Circuit Breaker Status

```json
{
  "lesson-service": {
    "patterns": {
      "get-lessons": {
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

## 🔐 Authentication & Authorization

### Clerk Integration

```typescript
@Get('profile')
@UseGuards(ClerkAuthGuard)
async getProfile(@CurrentUser() user: UserAuthPayload) {
  // User is authenticated via Clerk
  const profile = await this.sendToService('user-service', 'get-user-profile', { userId: user.id });
  return { data: profile };
}
```

### Public Endpoints

```typescript
@Get('public-info')
@Public()
async getPublicInfo() {
  // No authentication required
  const info = await this.sendToService('user-service', 'get-public-info', {});
  return { data: info };
}
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8000/api/health

# User endpoints
curl http://localhost:8000/api/users/public-info
curl http://localhost:8000/api/users/profile

# Lesson endpoints
curl http://localhost:8000/api/lessons/public-list
curl http://localhost:8000/api/lessons/list

# Progress endpoints
curl http://localhost:8000/api/progress/public-stats
```

### Automated Testing

```bash
# Run tests
npm run test:api-gateway

# Run e2e tests
npm run test:e2e:api-gateway
```

## 🚀 Best Practices

### 1. **Error Handling**

```typescript
try {
  const result = await this.sendToService('service-name', 'pattern', data);
  return result;
} catch (error) {
  this.logger.error('Service call failed', {
    service: 'service-name',
    pattern: 'pattern',
    error: error.message,
  });
  throw error;
}
```

### 2. **Performance Monitoring**

```typescript
const startTime = Date.now();
const result = await this.sendToService('service-name', 'pattern', data);
const duration = Date.now() - startTime;

this.logger.log('Service call completed', {
  service: 'service-name',
  pattern: 'pattern',
  duration: `${duration}ms`,
});
```

### 3. **Fallback Strategy**

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

## 📈 Performance Benefits

1. **Centralized Entry Point**: Single point of access for all clients
2. **Load Balancing**: Distribute requests across service instances
3. **Caching**: Cache frequently accessed data
4. **Circuit Breaker**: Prevent cascade failures
5. **Monitoring**: Centralized logging and metrics

## 🔮 Future Enhancements

### Phase 1 (Current) ✅

- [x] HTTP endpoints for client access
- [x] Kafka integration for service communication
- [x] Circuit breaker pattern
- [x] Health monitoring
- [x] Authentication integration

### Phase 2 (Next)

- [ ] Rate limiting
- [ ] Request/Response caching
- [ ] API versioning
- [ ] Request/Response transformation

### Phase 3 (Future)

- [ ] GraphQL support
- [ ] WebSocket support
- [ ] Advanced routing rules
- [ ] Service mesh integration

---

**🎉 API Gateway đã được thiết kế theo best practices và sẵn sàng cho production!**
