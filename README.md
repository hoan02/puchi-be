# Puchi Backend Microservices

## Tổng quan

- Dự án sử dụng kiến trúc microservices với các service: user, lesson, progress, media, notification, vocabulary, quiz, analytics, api-gateway.
- Message broker: **Kafka** (không còn RabbitMQ).
- Các service chạy trên các port:
  - API Gateway: 8000
  - User Service: 8001
  - Lesson Service: 8002
  - Progress Service: 8003
  - Media Service: 8004
  - Notification Service: 8005
  - Vocabulary Service: 8006
  - Quiz Service: 8007
  - Analytics Service: 8008

## Khởi động hệ thống

1. **Khởi động Kafka**
   ```sh
   npm run start:kafka
   ```
2. **Build toàn bộ service**
   ```sh
   npm run build
   ```
3. **Chạy tất cả service ở chế độ dev**
   ```sh
   npm run dev
   ```
   Hoặc chạy từng service:
   ```sh
   npm run dev:gateway
   npm run dev:user
   ...
   ```

## Test nhanh

- API Gateway: http://localhost:8000/api
- User Service: http://localhost:8001/api

## Lưu ý khi phát triển

- **Injection microservice client:**
  - Sử dụng `@Inject(CLIENT_NAMES.USER_SERVICE)` thay vì `'USER_SERVICE'`.
  - Các tên client khác xem trong `libs/shared/src/lib/constants/clients.constants.ts`.
- Đã loại bỏ hoàn toàn RabbitMQ, chỉ dùng Kafka.
- Các service có thể expose HTTP endpoint để test nhanh (ví dụ `/api`).

## Migration

- Đã chuyển toàn bộ message broker sang Kafka.
- Xóa toàn bộ cấu hình, script, constants liên quan RabbitMQ.
- Đã cập nhật script start/migrate cho Kafka.

## Liên hệ

- Nếu gặp lỗi hoặc cần hỗ trợ, liên hệ team backend.
