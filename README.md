# 🚀 Puchi Backend - Modern Microservices Architecture

## 📋 Tổng quan

Puchi Backend là một hệ thống microservices hiện đại được xây dựng với NestJS, sử dụng kiến trúc event-driven và fault-tolerant patterns. Hệ thống được thiết kế để hỗ trợ ứng dụng học ngôn ngữ với khả năng mở rộng cao và độ tin cậy tốt.

### 🏗️ Kiến trúc

- **Microservices Pattern**: 9 services độc lập, mỗi service có trách nhiệm riêng biệt
- **Event-Driven Architecture**: Sử dụng Kafka làm message broker
- **API Gateway**: Điểm vào duy nhất cho tất cả client requests
- **Circuit Breaker Pattern**: Đảm bảo fault tolerance
- **Service Discovery**: Tự động khám phá và kết nối services
- **Health Monitoring**: Theo dõi sức khỏe hệ thống real-time

### 🔧 Services

| Service              | Port | Mô tả                                     |
| -------------------- | ---- | ----------------------------------------- |
| API Gateway          | 8000 | Điểm vào chính, routing và authentication |
| User Service         | 8001 | Quản lý người dùng và authentication      |
| Lesson Service       | 8002 | Quản lý bài học và nội dung               |
| Progress Service     | 8003 | Theo dõi tiến độ học tập                  |
| Media Service        | 8004 | Quản lý file media (audio, video, image)  |
| Notification Service | 8005 | Gửi thông báo real-time                   |
| Vocabulary Service   | 8006 | Quản lý từ vựng và flashcard              |
| Quiz Service         | 8007 | Hệ thống câu hỏi và đánh giá              |
| Analytics Service    | 8008 | Phân tích dữ liệu và báo cáo              |

## 🚀 Khởi động hệ thống

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Khởi động Kafka

```bash
# Windows
.\scripts\start-kafka.ps1

# Linux/Mac
./scripts/start-kafka.sh
```

### 3. Build toàn bộ services

```bash
npm run build
```

### 4. Khởi động tất cả services

```bash
# Sử dụng script tự động
.\scripts\start-all-services.ps1

# Hoặc chạy thủ công
npm run start:dev
```

## 🧪 Testing

### Test Communication

```bash
# Test microservice communication
.\scripts\test-microservice-communication.ps1
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# User service
curl http://localhost:8000/users/public-info

# Lesson service
curl http://localhost:8000/lessons/public-list

# Progress service
curl http://localhost:8000/progress/public-stats
```

## 📚 Tài liệu

- [Microservice Architecture](./docs/MICROSERVICE_ARCHITECTURE.md) - Kiến trúc tổng thể
- [Controller Architecture](./docs/CONTROLLER_ARCHITECTURE.md) - Kiến trúc controller
- [Microservice Communication](./docs/MICROSERVICE_COMMUNICATION.md) - Giao tiếp giữa services
- [Kafka Setup](./docs/KAFKA.md) - Cấu hình Kafka
- [Logging Guidelines](./docs/LOGGING_GUIDELINES.md) - Hướng dẫn logging

## 🔧 Development

### Cấu trúc Project

```
puchi-be/
├── apps/                    # Microservices
│   ├── api-gateway/        # API Gateway
│   ├── user-service/       # User Management
│   ├── lesson-service/     # Lesson Management
│   └── ...                 # Other services
├── libs/                   # Shared libraries
│   ├── shared/            # Common utilities
│   └── database/          # Database utilities
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

### Key Features

#### 🔄 Base Controller Pattern

Tất cả controllers kế thừa từ `BaseController` với các tính năng:

- Service client management
- Circuit breaker integration
- Health check endpoints
- Automatic reply topic subscription
- Lifecycle management

#### 🛡️ Circuit Breaker

```typescript
const result = await this.sendToService('user-service', 'get-user-profile', data, {
  timeout: 10000,
  retries: 2,
  circuitBreaker: true,
});
```

#### 📡 Kafka Communication

- **Request-Response**: Sử dụng `send()` với reply topics
- **Event-Driven**: Sử dụng `emit()` cho async communication
- **Automatic Subscription**: Tự động subscribe reply topics

#### 🔍 Health Monitoring

```bash
# Service health
GET /health

# Service info
GET /info

# Circuit breaker status
GET /circuit-breakers
```

## 🚀 Deployment

### Production

```bash
# Build production
npm run build:prod

# Start production
npm run start:prod
```

### Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 🔐 Security

- **Authentication**: Clerk integration
- **Authorization**: Role-based access control
- **Data Protection**: Encryption và validation
- **Service-to-Service**: Secure communication

## 📊 Monitoring

- **Health Checks**: Real-time service health
- **Circuit Breakers**: Fault tolerance monitoring
- **Logging**: Structured logging với correlation IDs
- **Metrics**: Performance và error tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

**Bản quyền © 2024 - Tất cả quyền được bảo lưu**

Dự án này được phát triển và sở hữu bởi tác giả. Không được phép sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản.

### Điều khoản sử dụng:

- Dự án này được phát triển cho mục đích học tập và nghiên cứu
- Không được phép sử dụng cho mục đích thương mại
- Không được phép phân phối lại mã nguồn
- Mọi vi phạm sẽ được xử lý theo quy định pháp luật

## 📞 Liên hệ

- **Tác giả**: Lê Công Hoan
- **Email**: lehoan.dev@gmail.com

---

**Lưu ý**: Dự án này đang trong giai đoạn phát triển. Vui lòng báo cáo bugs và đề xuất tính năng mới thông qua GitHub Issues.
