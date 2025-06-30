# 🚀 Kiến trúc Microservice Hiện đại - Puchi Backend

## 📋 Tổng quan

Dự án Puchi Backend sử dụng kiến trúc microservice hiện đại với **API Gateway Pattern** và **Event-Driven Architecture**:

### 🎯 Tính năng chính

1. **API Gateway Pattern** - Entry point duy nhất cho client
2. **Kafka Message Broker** - Internal service communication
3. **Circuit Breaker Pattern** - Fault tolerance
4. **Service Discovery** - Dynamic service management
5. **Health Monitoring** - Real-time observability
6. **Event-Driven Architecture** - Loose coupling

## 🏗️ Kiến trúc hệ thống

```
┌───────────────────────────────────────────────────────────────┐
│                    Client Applications                        │
│                    (Frontend, Mobile)                         │
└─────────────────────────────┬─────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                        API Gateway                            │
│                        (Port 8000)                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐ │
│  │LessonsController│ │ UsersController │ │ProgressController│ │
│  │                 │ │                 │ │                  │ │
│  └─────────────────┘ └─────────────────┘ └──────────────────┘ │
│                           ...                                 │
└────────────────────────────┬──────────────────────────────────┘
                             │ Kafka Topics
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                       Kafka Broker                           │
│                       (Port 9092)                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │ Request-Response│ │ Event Topics    │ │ Reply Topics    │ │
│  │ Topics          │ │                 │ │                 │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└──────────────────────────────┬───────────────────────────────┘
                               │ Kafka Transport
                               ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│  User Service    │ │ Lesson Service  │ │ Progress Service │
│  (Kafka Only)    │ │  (Kafka Only)   │ │  (Kafka Only)    │
│  Port: 8001      │ │  Port: 8002     │ │  Port: 8003      │
└──────────────────┘ └─────────────────┘ └──────────────────┘
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│ Media Service    │ │Notification Svc │ │Vocabulary Service│
│  (Kafka Only)    │ │  (Kafka Only)   │ │  (Kafka Only)    │
│  Port: 8004      │ │  Port: 8005     │ │  Port: 8006      │
└──────────────────┘ └─────────────────┘ └──────────────────┘
┌──────────────────┐ ┌─────────────────┐
│  Quiz Service    │ │Analytics Service│
│  (Kafka Only)    │ │  (Kafka Only)   │
│  Port: 8007      │ │  Port: 8008     │
└──────────────────┘ └─────────────────┘
```

## 🔧 Các thành phần chính

### 1. API Gateway (HTTP Server)

**File:** `apps/api-gateway/src/main.ts`

```typescript
// HTTP Server với CORS và logging
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});
await app.listen(8000);
```

**HTTP Endpoints:**

- `GET /api/health` - Health check với dependencies
- `GET /api/services/status` - All services status
- `GET /api/lessons/*` - Lesson management
- `GET /api/users/*` - User management
- `GET /api/progress/*` - Progress tracking

### 2. Microservices (Kafka Only)

**Tất cả services khác chỉ sử dụng Kafka transport:**

```typescript
// apps/user-service/src/main.ts
const app = await NestFactory.createMicroservice(AppModule, USER_CLIENT_KAFKA_OPTIONS);
await app.listen(); // Chỉ Kafka, không có HTTP server
```

**Services:**

- User Service (Port 8001) - Kafka only
- Lesson Service (Port 8002) - Kafka only
- Progress Service (Port 8003) - Kafka only
- Media Service (Port 8004) - Kafka only
- Notification Service (Port 8005) - Kafka only
- Vocabulary Service (Port 8006) - Kafka only
- Quiz Service (Port 8007) - Kafka only
- Analytics Service (Port 8008) - Kafka only

### 3. Base Controller Pattern

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

### 4. Service Client với Circuit Breaker

```typescript
export class ServiceClient {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  async send<T>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T> {
    // Request-response với circuit breaker
  }

  async emit<T>(pattern: string, data: any, options?: ServiceCallOptions): Promise<T> {
    // Fire-and-forget events
  }
}
```

## 🔄 Communication Patterns

### 1. Client → API Gateway (HTTP/REST)

```bash
# Frontend gọi API Gateway
GET http://localhost:8000/api/lessons/list
POST http://localhost:8000/api/lessons
GET http://localhost:8000/api/users/profile
```

### 2. API Gateway → Microservices (Kafka)

```typescript
// API Gateway gọi microservices qua Kafka
const lessons = await this.sendToService('lesson-service', 'get-lessons', { userId });
const userProfile = await this.sendToService('user-service', 'get-user-profile', { userId });
```

### 3. Service-to-Service (Kafka Events)

```typescript
// Services giao tiếp với nhau qua events
await this.emitToService('progress-service', 'lesson-completed', { userId, lessonId });
await this.emitToService('analytics-service', 'user-activity', { userId, action });
```

## 📡 Kafka Topics Architecture

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

## 🛡️ Fault Tolerance

### Circuit Breaker States

1. **CLOSED**: Normal operation
2. **OPEN**: Service is failing, requests are blocked
3. **HALF_OPEN**: Testing if service is recovered

### Retry Strategy

```typescript
const options: ServiceCallOptions = {
  timeout: 10000, // 10 seconds
  retries: 3, // Retry 3 times
  circuitBreaker: true, // Enable circuit breaker
};
```

## 📊 Monitoring & Observability

### Health Check Endpoints

```bash
# API Gateway health
GET http://localhost:8000/api/health

# Service status
GET http://localhost:8000/api/services/status

# Circuit breaker status
GET http://localhost:8000/api/circuit-breakers
```

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

## 🚀 Deployment Architecture

### Development

```bash
# Start Kafka
npm run kafka:up

# Start all services
npm run start:dev

# Test communication
npm run test:communication
```

### Production (Docker)

```yaml
# docker-compose.yml
services:
  kafka:
    image: confluentinc/cp-kafka:latest
    ports: ['9092:9092']

  api-gateway:
    build: ./apps/api-gateway
    ports: ['8000:8000']
    depends_on: ['kafka']

  user-service:
    build: ./apps/user-service
    depends_on: ['kafka']
    # No ports exposed - Kafka only
```

## 🎯 Best Practices Implemented

### 1. **API Gateway Pattern** ✅

- Single entry point cho tất cả client requests
- Centralized authentication và authorization
- Request routing và load balancing
- CORS và security headers

### 2. **Event-Driven Architecture** ✅

- Loose coupling giữa services
- Async processing cho better performance
- Event sourcing cho audit trail
- Scalable message processing

### 3. **Circuit Breaker Pattern** ✅

- Automatic failure detection
- Fallback mechanisms
- Service isolation
- Quick failure recovery

### 4. **Service Discovery** ✅

- Dynamic service registration
- Health-based routing
- Automatic service detection
- Load balancing

## 📈 Performance Benefits

1. **Scalability**: Mỗi service có thể scale độc lập
2. **Resilience**: Circuit breaker prevents cascade failures
3. **Performance**: Async processing với Kafka
4. **Maintainability**: Clear separation of concerns
5. **Reliability**: Automatic retry và error handling

## 🔮 Roadmap

### Phase 1 (Current) ✅

- [x] API Gateway với HTTP endpoints
- [x] Kafka-only microservices
- [x] Circuit breaker pattern
- [x] Service discovery
- [x] Health monitoring

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
