# Kafka Implementation Guide

## 📋 Tổng quan

Tài liệu này mô tả việc triển khai Kafka cho dự án Puchi Backend với kiến trúc **API Gateway + Kafka-only Microservices**.

## 🎯 Lý do sử dụng Kafka

1. **Event-Driven Architecture**: Loose coupling giữa services
2. **Scalability**: Xử lý được lượng events lớn
3. **Fault Tolerance**: Circuit breaker và retry mechanisms
4. **Event Retention**: Lưu trữ events lâu dài cho analytics
5. **Replay Capability**: Có thể replay events để rebuild data
6. **Performance**: Async processing cho better throughput

## 🏗️ Kiến trúc hiện tại

### Communication Flow

```
Client Apps → HTTP → API Gateway → Kafka → Microservices
                ↑                    ↓
            (External)           (Internal)
```

### Service Architecture

| Service              | Transport | Port | HTTP Endpoints | Kafka Topics |
| -------------------- | --------- | ---- | -------------- | ------------ |
| API Gateway          | HTTP      | 8000 | ✅ Có          | Producer     |
| User Service         | Kafka     | 8001 | ❌ Không       | Consumer     |
| Lesson Service       | Kafka     | 8002 | ❌ Không       | Consumer     |
| Progress Service     | Kafka     | 8003 | ❌ Không       | Consumer     |
| Media Service        | Kafka     | 8004 | ❌ Không       | Consumer     |
| Notification Service | Kafka     | 8005 | ❌ Không       | Consumer     |
| Vocabulary Service   | Kafka     | 8006 | ❌ Không       | Consumer     |
| Quiz Service         | Kafka     | 8007 | ❌ Không       | Consumer     |
| Analytics Service    | Kafka     | 8008 | ❌ Không       | Consumer     |

### Kafka Topics

#### Request-Response Topics

```
get-user-profile          # User profile requests
get-user-profile.reply    # User profile responses
get-lessons               # Lesson list requests
get-lessons.reply         # Lesson list responses
get-lesson-by-id          # Single lesson requests
get-lesson-by-id.reply    # Single lesson responses
get-user-progress         # Progress requests
get-user-progress.reply   # Progress responses
```

#### Event Topics

```
user-events               # User-related events
lesson-events             # Lesson-related events
progress-events           # Progress-related events
analytics-events          # Analytics events
media-events              # Media-related events
notification-events       # Notification events
vocabulary-events         # Vocabulary events
quiz-events               # Quiz-related events
```

### Consumer Groups

```
user-service-group
lesson-service-group
progress-service-group
media-service-group
notification-service-group
vocabulary-service-group
quiz-service-group
analytics-service-group
```

## 🚀 Setup và Deployment

### Phase 1: Setup Infrastructure

1. **Cài đặt dependencies**

   ```bash
   npm install kafkajs @nestjs/event-emitter --legacy-peer-deps
   ```

2. **Start Kafka infrastructure**

   ```bash
   # Windows
   .\scripts\start-kafka.ps1

   # Linux/Mac
   ./scripts/start-kafka.sh
   ```

3. **Tạo Kafka topics**
   ```bash
   npm run kafka:topics
   ```

### Phase 2: Start Services

```bash
# Start all services
npm run start:dev

# Hoặc start từng service
npm run dev:gateway    # API Gateway (HTTP + Kafka)
npm run dev:user       # User Service (Kafka only)
npm run dev:lesson     # Lesson Service (Kafka only)
npm run dev:progress   # Progress Service (Kafka only)
```

## 🔧 Service Implementation

### 1. API Gateway (HTTP + Kafka Producer)

```typescript
// apps/api-gateway/src/main.ts
const app = await NestFactory.create(AppModule); // HTTP server
await app.listen(8000);

// apps/api-gateway/src/controllers/lessons.controller.ts
@Controller('lessons')
export class LessonsController extends BaseController {
  @Get('list')
  async getLessons() {
    // HTTP endpoint → Kafka → Lesson Service
    const lessons = await this.sendToService('lesson-service', 'get-lessons', {});
    return { data: lessons };
  }
}
```

### 2. Microservices (Kafka Only)

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

## 📊 Monitoring và Debugging

### Kafka UI

- URL: http://localhost:8080
- Monitor topics, consumers, producers

### Health Checks

```bash
# API Gateway (HTTP)
curl http://localhost:8000/api/health

# Service status (HTTP)
curl http://localhost:8000/api/services/status
```

### Logs

```bash
# Kafka logs
docker-compose logs kafka

# Service logs
npm run docker:logs
```

## 📈 Performance Metrics

### Current Performance (Kafka)

- Throughput: ~1M+ msg/sec
- Latency: ~10ms
- Retention: 30 days (configurable)
- Consumer Groups: Parallel processing

### HTTP vs Kafka Performance

| Metric          | HTTP/REST  | Kafka     |
| --------------- | ---------- | --------- |
| Latency         | ~50ms      | ~10ms     |
| Throughput      | ~10K req/s | ~1M msg/s |
| Scalability     | Limited    | High      |
| Fault Tolerance | Basic      | Advanced  |

## 🔍 Troubleshooting

### Common Issues

1. **Kafka not starting**

   ```bash
   docker-compose down
   docker-compose up -d zookeeper kafka
   ```

2. **Topics not created**

   ```bash
   docker exec kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   ```

3. **Consumer group issues**
   ```bash
   docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
   ```

### Debug Commands

```bash
# List topics
npm run kafka:topics

# Check consumer groups
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group user-service-group

# Monitor messages
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user-events --from-beginning
```

## 🎯 Best Practices

### 1. **API Gateway Pattern** ✅

- Single entry point cho client requests
- Centralized authentication
- Request routing và load balancing

### 2. **Kafka-only Microservices** ✅

- Loose coupling
- Better scalability
- Fault tolerance với circuit breaker

### 3. **Event-Driven Architecture** ✅

- Async processing
- Event sourcing
- Audit trail

### 4. **Circuit Breaker Pattern** ✅

- Automatic failure detection
- Fallback mechanisms
- Service isolation

## 🔮 Next Steps

1. **Implement ML/AI pipelines**
2. **Add monitoring và alerting**
3. **Performance optimization**
4. **Production deployment**
5. **Event schema evolution**

## 📚 References

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [NestJS Microservices](https://docs.nestjs.com/microservices/kafka)
- [KafkaJS Documentation](https://kafka.js.org/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
