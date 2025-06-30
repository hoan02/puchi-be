# 🚀 Puchi Backend - Modern Microservices Architecture

> **Đây là backend cho dự án [Puchi](https://github.com/hoan02/puchi) - nền tảng học tiếng Việt hiện đại tại [puchi.io.vn](https://puchi.io.vn).**
>
> Backend này cung cấp toàn bộ API, authentication, quản lý dữ liệu, và các microservices cho ứng dụng Puchi.

## 📋 Tổng quan

Puchi Backend là một hệ thống microservices hiện đại được xây dựng với NestJS, sử dụng kiến trúc event-driven và fault-tolerant patterns. Hệ thống được thiết kế để hỗ trợ ứng dụng học ngôn ngữ với khả năng mở rộng cao và độ tin cậy tốt.

### 🏗️ Kiến trúc tổng thể

```
Client Apps → HTTP → API Gateway (Port 8000) → Kafka → Microservices (Kafka only)
```

- **API Gateway**: Entry point duy nhất cho tất cả client requests (HTTP/REST)
- **Kafka**: Message broker cho toàn bộ giao tiếp giữa các service
- **Microservices**: Chỉ giao tiếp nội bộ qua Kafka, không expose HTTP endpoint
- **Circuit Breaker**: Đảm bảo fault tolerance
- **Health Monitoring**: Theo dõi sức khỏe hệ thống real-time tại API Gateway

### 🔧 Services

| Service              | Port | Transport | HTTP Endpoints | Mô tả                                     |
| -------------------- | ---- | --------- | -------------- | ----------------------------------------- |
| API Gateway          | 8000 | HTTP      | ✅             | Điểm vào chính, routing và authentication |
| User Service         | 8001 | Kafka     | ❌             | Quản lý người dùng và authentication      |
| Lesson Service       | 8002 | Kafka     | ❌             | Quản lý bài học và nội dung               |
| Progress Service     | 8003 | Kafka     | ❌             | Theo dõi tiến độ học tập                  |
| Media Service        | 8004 | Kafka     | ❌             | Quản lý file media (audio, video, image)  |
| Notification Service | 8005 | Kafka     | ❌             | Gửi thông báo real-time                   |
| Vocabulary Service   | 8006 | Kafka     | ❌             | Quản lý từ vựng và flashcard              |
| Quiz Service         | 8007 | Kafka     | ❌             | Hệ thống câu hỏi và đánh giá              |
| Analytics Service    | 8008 | Kafka     | ❌             | Phân tích dữ liệu và báo cáo              |

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

### Manual Testing (qua API Gateway)

```bash
# Health check (chỉ API Gateway)
curl http://localhost:8000/api/health

# User service (qua API Gateway)
curl http://localhost:8000/api/users/public-info

# Lesson service (qua API Gateway)
curl http://localhost:8000/api/lessons/public-list

# Progress service (qua API Gateway)
curl http://localhost:8000/api/progress/public-stats
```

## 📚 Tài liệu

- [Microservice Architecture](./docs/MICROSERVICE_ARCHITECTURE.md) - Kiến trúc tổng thể
- [Controller Architecture](./docs/CONTROLLER_ARCHITECTURE.md) - Kiến trúc controller
- [Microservice Communication](./docs/MICROSERVICE_COMMUNICATION.md) - Giao tiếp giữa services
- [Kafka Setup](./docs/KAFKA.md) - Cấu hình Kafka

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
- Health check endpoints (chỉ ở API Gateway)
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

- **Chỉ API Gateway expose các endpoint health/info/circuit-breakers**

```bash
# Service health
GET /api/health

# Service info
GET /api/info

# Circuit breaker status
GET /api/circuit-breakers
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

- **Authentication**: Clerk integration tại API Gateway
- **Authorization**: Role-based access control tại API Gateway
- **Data Protection**: Encryption và validation
- **Service-to-Service**: Secure communication qua Kafka

## 📊 Monitoring

- **Health Checks**: Real-time service health (API Gateway)
- **Circuit Breakers**: Fault tolerance monitoring (API Gateway)
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
