# Kafka Implementation Guide

## Tổng quan

Tài liệu này mô tả việc triển khai Kafka cho dự án Puchi-be.

## Lý do sử dụng Kafka

1. **Event Streaming**: Kafka phù hợp cho event-driven architecture
2. **ML/AI Pipeline**: Hỗ trợ tốt cho machine learning workflows
3. **Scalability**: Xử lý được lượng events lớn hơn
4. **Event Retention**: Lưu trữ events lâu dài cho analytics
5. **Replay Capability**: Có thể replay events để rebuild data

## Kiến trúc hiện tại

### Kafka Topics

```
user-learning-events     # Events liên quan đến học tập
lesson-events           # Events liên quan đến bài học
progress-events         # Events liên quan đến tiến độ
analytics-events        # Events cho analytics
user-events             # Events liên quan đến user
media-events            # Events liên quan đến media
notification-events     # Events liên quan đến notification
vocabulary-events       # Events liên quan đến từ vựng
quiz-events             # Events liên quan đến quiz
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

## Setup và Deployment

### Phase 1: Setup Infrastructure

1. **Cài đặt dependencies**

   ```bash
   npm install kafkajs @nestjs/event-emitter --legacy-peer-deps
   ```

2. **Start Kafka infrastructure**

   ```bash
   npm run kafka:up
   ```

3. **Tạo Kafka topics**
   ```bash
   npm run kafka:topics
   ```

### Phase 2: Start Services

```bash
# Start all services
npm run migrate:kafka

# Hoặc start từng service
npm run dev:analytics
npm run dev:gateway
npm run dev:core
npm run dev:feature
```

## Services đã được migrate

- ✅ **Analytics Service**: Sử dụng Kafka cho event processing
- ✅ **API Gateway**: Producer cho user events
- ✅ **User Service**: Consumer cho user events
- ✅ **Lesson Service**: Consumer cho lesson events
- ✅ **Progress Service**: Consumer cho progress events
- ✅ **Media Service**: Consumer cho media events
- ✅ **Notification Service**: Consumer cho notification events
- ✅ **Vocabulary Service**: Consumer cho vocabulary events
- ✅ **Quiz Service**: Consumer cho quiz events

## Monitoring và Debugging

### Kafka UI

- URL: http://localhost:8080
- Monitor topics, consumers, producers

### Health Checks

```bash
# Analytics Service
curl http://localhost:8008/health

# API Gateway
curl http://localhost:8000/health
```

### Logs

```bash
# Kafka logs
docker-compose logs kafka

# Service logs
npm run docker:logs
```

## Performance Metrics

### Current Performance (Kafka)

- Throughput: ~1M+ msg/sec
- Latency: ~10ms
- Retention: 30 days (configurable)
- Consumer Groups: Parallel processing

## Troubleshooting

### Common Issues

1. **Kafka not starting**

   ```bash
   docker-compose down
   docker-compose up -d zookeeper kafka
   ```

2. **Topics not created**

   ```bash
   docker exec kafka kafka-topics --create --topic user-learning-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
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
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group analytics-service-group

# Monitor messages
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user-learning-events --from-beginning
```

## Next Steps

1. **Implement ML/AI pipelines**
2. **Add monitoring and alerting**
3. **Performance optimization**
4. **Production deployment**
5. **Event schema evolution**

## References

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [NestJS Microservices](https://docs.nestjs.com/microservices/kafka)
- [KafkaJS Documentation](https://kafka.js.org/)
