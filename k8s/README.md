# Kubernetes Configuration cho Puchi Backend

Thư mục này chứa các file cấu hình Kubernetes để deploy hệ thống Puchi Backend.

## Cấu trúc Files

### Core Infrastructure

- `puchi-infra.yaml` - Infrastructure components (Kafka KRaft mode, PostgreSQL 17, MongoDB 8)
- `storage.yaml` - StorageClass và PersistentVolume definitions
- `secrets.yaml` - Kubernetes Secrets cho passwords và sensitive data

### Application Services

- `puchi-services.yaml` - Tất cả microservices và API Gateway
- `ingress.yaml` - Ingress configuration để expose API Gateway, Kafka UI, MongoDB Express

### Organization

- `namespace.yaml` - Namespace definitions cho các môi trường khác nhau

## Deployment Order

1. **Namespace** (nếu cần):

   ```bash
   kubectl apply -f namespace.yaml
   ```

2. **Storage**:

   ```bash
   kubectl apply -f storage.yaml
   ```

3. **Secrets**:

   ```bash
   kubectl apply -f secrets.yaml
   ```

4. **Infrastructure**:

   ```bash
   kubectl apply -f puchi-infra.yaml
   ```

5. **Services**:

   ```bash
   kubectl apply -f puchi-services.yaml
   ```

6. **Ingress** (tùy chọn):
   ```bash
   kubectl apply -f ingress.yaml
   ```

## Cải thiện đã thực hiện

### ✅ Bảo mật

- Sử dụng Kubernetes Secrets thay vì hardcode passwords
- Tách biệt sensitive data ra file riêng
- MongoDB secret cho MongoDB services

### ✅ Resource Management

- Thêm resource limits cho tất cả services
- CPU: 100m-500m, Memory: 128Mi-512Mi

### ✅ Health Checks

- Thêm readiness và liveness probes cho tất cả services
- Health check endpoint: `/health`

### ✅ Image Management

- Sử dụng specific image tags thay vì `latest`
- Format: `hoanit/service-name:v1.0.0`

### ✅ Storage

- Tạo StorageClass và PersistentVolume
- Sử dụng hostPath cho development (có thể thay đổi cho production)

### ✅ Networking

- Thêm Ingress để expose API Gateway
- CORS configuration
- LoadBalancer service option

## Environment Variables

### Database Connections (Polyglot Persistence)

#### PostgreSQL 17 Services

- `user-db`: PostgreSQL cho User Service (puchi_user_db)
- `lesson-db`: PostgreSQL cho Lesson Service (puchi_lesson_db)
- `progress-db`: PostgreSQL cho Progress Service (puchi_progress_db)
- `notification-db`: PostgreSQL cho Notification Service (puchi_notification_db)
- `vocabulary-db`: PostgreSQL cho Vocabulary Service (puchi_vocabulary_db)

#### MongoDB 8 Services

- `analytics-db`: MongoDB cho Analytics Service (puchi_analytics_db)
- `media-db`: MongoDB cho Media Service (puchi_media_db)
- `quiz-db`: MongoDB cho Quiz Service (puchi_quiz_db)

### Kafka Configuration

- Broker: `kafka:29092` (Bitnami Kafka với KRaft mode)
- No Zookeeper required (KRaft mode)

### gRPC Services

- User Service: `user-service:50051`
- Lesson Service: `lesson-service:50052`
- Progress Service: `progress-service:50053`
- Notification Service: `notification-service:50054`
- Media Service: `media-service:50055`
- Quiz Service: `quiz-service:50056`
- Vocabulary Service: `vocabulary-service:50057`
- Analytics Service: `analytics-service:50058`

## Monitoring

### Health Check Endpoints

- API Gateway: `http://api-gateway:8000/api/health`
- User Service: `http://user-service:8001/health`
- Lesson Service: `http://lesson-service:8002/health`
- Progress Service: `http://progress-service:8003/health`
- Media Service: `http://media-service:8004/health`
- Notification Service: `http://notification-service:8005/health`
- Vocabulary Service: `http://vocabulary-service:8006/health`
- Quiz Service: `http://quiz-service:8007/health`
- Analytics Service: `http://analytics-service:8008/health`

### Management UIs

- Kafka UI: `http://kafka-ui:8081` (via ingress: `kafka.puchi.local`)
- MongoDB Express: `http://mongo-express:8082` (via ingress: `mongo.puchi.local`)

## Production Considerations

1. **Storage**: Thay đổi StorageClass từ `hostPath` sang cloud storage (AWS EBS, GCP PD, Azure Disk)
2. **Secrets**: Sử dụng external secret management (HashiCorp Vault, AWS Secrets Manager)
3. **Ingress**: Cấu hình SSL/TLS certificates
4. **Monitoring**: Thêm Prometheus và Grafana
5. **Logging**: Cấu hình centralized logging (ELK stack, Fluentd)
6. **Backup**: Cấu hình database backup strategy
7. **Scaling**: Thêm HorizontalPodAutoscaler cho các services

## Troubleshooting

### Kiểm tra status

```bash
kubectl get pods
kubectl get services
kubectl get pvc
kubectl get secrets
```

### Logs

```bash
kubectl logs -f deployment/api-gateway
kubectl logs -f deployment/user-service
```

### Describe resources

```bash
kubectl describe pod <pod-name>
kubectl describe service <service-name>
```
