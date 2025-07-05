# Development Guide

## 🚀 Quick Start

### 1. Khởi động development environment

```powershell
# Khởi động với build
.\scripts\dev-start.ps1 -Build

# Khởi động với clean (xóa containers cũ)
.\scripts\dev-start.ps1 -Clean

# Khởi động bình thường
.\scripts\dev-start.ps1
```

### 2. Truy cập services

- **API Gateway**: http://localhost:8000
- **User Service**: localhost:50051 (gRPC)
- **Database**: localhost:5432
- **Kafka**: localhost:9092

## 📁 Cấu trúc Development

```
puchi-be/
├── docker-compose.dev.yaml    # Development environment
├── docker-compose.yaml        # Production environment
├── scripts/
│   ├── dev-start.ps1         # Khởi động development
│   ├── dev-add-service.ps1   # Thêm service mới
│   └── setup-env.ps1         # Tạo .env files
└── apps/
    ├── api-gateway/
    │   ├── .env              # Development config
    │   └── env.example       # Template
    └── user-service/
        ├── .env              # Development config
        └── env.example       # Template
```

## 🔧 Development Workflow

### 1. Thêm service mới

```powershell
# Thêm service không có database
.\scripts\dev-add-service.ps1 -ServiceName "lesson-service"

# Thêm service có database
.\scripts\dev-add-service.ps1 -ServiceName "lesson-service" -WithDatabase
```

### 2. Hot Reload

Các services được mount volume để hot reload:

- Code changes sẽ tự động reload
- Không cần restart container

### 3. Database Migration

```powershell
# Chạy migration cho user-service
docker exec -it user-service-dev npx prisma migrate dev

# Reset database
docker exec -it user-service-dev npx prisma migrate reset
```

## 🐛 Debugging

### View logs

```powershell
# Tất cả services
docker-compose -f docker-compose.dev.yaml logs -f

# Chỉ API Gateway
docker-compose -f docker-compose.dev.yaml logs -f api-gateway

# Chỉ User Service
docker-compose -f docker-compose.dev.yaml logs -f user-service
```

### Access database

```powershell
# PostgreSQL
docker exec -it user-db-dev psql -U puchi_user -d puchi_user_db

# Prisma Studio
docker exec -it user-service-dev npx prisma studio
```

### Access Kafka

```powershell
# Kafka CLI
docker exec -it kafka-dev kafka-topics --list --bootstrap-server localhost:9092
```

## 🛠️ Useful Commands

```powershell
# Stop development environment
docker-compose -f docker-compose.dev.yaml down

# Restart specific service
docker-compose -f docker-compose.dev.yaml restart user-service

# Rebuild specific service
docker-compose -f docker-compose.dev.yaml build user-service

# Clean up everything
docker-compose -f docker-compose.dev.yaml down -v
docker system prune -f
```

## 🔐 Environment Variables

### API Gateway (.env)

```env
NODE_ENV=development
PORT=8000
USER_SERVICE_GRPC_URL=user-service:50051
KAFKA_BROKERS=kafka:29092
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### User Service (.env)

```env
NODE_ENV=development
PORT=50051
DATABASE_URL=postgresql://puchi_user:123456@user-db:5432/puchi_user_db
KAFKA_BROKERS=kafka:29092
```

## 📝 Notes

1. **Development vs Production**:
   - Development: Hot reload, local volumes, debug mode
   - Production: Optimized builds, secrets, health checks

2. **Service Dependencies**:
   - API Gateway → User Service
   - User Service → Database + Kafka
   - Các service khác sẽ trả về lỗi khi chưa có

3. **Database per Service**:
   - Mỗi service có database riêng
   - Không chia sẻ database giữa services

4. **Kafka Topics**:
   - Tự động tạo topics khi cần
   - Có thể monitor qua Kafka UI (port 8081)
