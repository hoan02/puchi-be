# PuchiBe Backend

PuchiBe là hệ thống backend sử dụng kiến trúc microservices, được xây dựng với NestJS, Prisma, RabbitMQ và quản lý bằng Nx Monorepo. Tích hợp với [Puchi Frontend](https://github.com/hoan02/puchi) sử dụng Clerk authentication.

## 🚀 Công nghệ sử dụng

- **Node.js** + **TypeScript**
- **NestJS** (v11)
- **Prisma ORM**
- **RabbitMQ** (message broker)
- **Clerk** (authentication)
- **Nx Monorepo**
- **Jest** (unit test)
- **ESLint, Prettier** (code style)
- **Docker Compose** (chạy RabbitMQ)

## 🏗️ Kiến trúc tổng quan

- **API Gateway**: Entry point cho client, xác thực qua Clerk, nhận request và emit event qua RabbitMQ.
- **Lesson Service**: Xử lý logic bài học, lưu vào database, phát tán event sang các service khác.
- **Các service khác**: (progress, audio, notification, vocab) nhận event để xử lý nghiệp vụ riêng.
- **Shared Library**: Chứa DTO, interface, constants, utils, guards, decorators dùng chung.

## 📦 Cấu trúc thư mục

```
apps/
  api-gateway/         # API Gateway service
  lesson-service/      # Lesson service
  ...-e2e/             # E2E test
libs/
  database/            # PrismaService, DatabaseModule
  shared/              # DTO, interface, utils, guards, decorators
prisma/schema.prisma   # Định nghĩa database
prisma/seed.ts         # Database seeding
```

## 🔄 Sơ đồ luồng hoạt động

```mermaid
sequenceDiagram
    participant Client
    participant API-Gateway
    participant Clerk
    participant RabbitMQ
    participant Lesson-Service
    participant Database
    participant Other-Services

    Client->>API-Gateway: POST /lesson (with Bearer token)
    API-Gateway->>Clerk: Verify token
    Clerk->>API-Gateway: User info
    API-Gateway->>RabbitMQ: emit lesson-created (with user data)
    RabbitMQ->>Lesson-Service: lesson-created event
    Lesson-Service->>Database: Lưu lesson + user
    Lesson-Service->>Other-Services: emit các event khác (progress, audio, ...)
    API-Gateway->>Client: Trả về kết quả
```

## ⚙️ Hướng dẫn chạy dự án

### 1. Cài đặt dependencies:

```sh
npm install
```

### 2. Cấu hình environment variables:

Tạo file `.env` với các biến sau:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/puchi_db"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key_here"
CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key_here"

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Application
NODE_ENV="development"
PORT=3000
```

### 3. Thiết lập Clerk:

1. Đăng ký tài khoản tại [clerk.com](https://clerk.com)
2. Tạo application mới
3. Copy Secret Key và Publishable Key vào file `.env`
4. Cấu hình CORS origins cho frontend domain

### 4. Khởi động RabbitMQ:

```sh
npm run docker:up
```

### 5. Thiết lập database:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 6. Khởi động development servers:

```sh
npm run dev
```

## 📚 Scripts hữu ích

### 🚀 Development

```sh
npm run dev                    # Chạy cả 2 services (parallel)
npm run dev:gateway           # Chỉ chạy API Gateway
npm run dev:lesson            # Chỉ chạy Lesson Service
```

### 🏗️ Build & Production

```sh
npm run build                 # Build tất cả services
npm run build:gateway         # Build API Gateway
npm run build:lesson          # Build Lesson Service
npm run start:prod            # Chạy production mode
```

### 🧪 Testing

```sh
npm run test                  # Test tất cả services
npm run test:gateway          # Test API Gateway
npm run test:lesson           # Test Lesson Service
```

### 🔍 Code Quality

```sh
npm run lint                  # Kiểm tra code style
npm run lint:fix              # Tự động fix code style
npm run format                # Format code với Prettier
npm run format:check          # Kiểm tra format
```

### 🗄️ Database

```sh
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Chạy migrations
npm run db:migrate:deploy     # Deploy migrations (production)
npm run db:studio             # Mở Prisma Studio
npm run db:reset              # Reset database
npm run db:seed               # Seed dữ liệu mẫu
```

### 🐳 Docker

```sh
npm run docker:up             # Khởi động RabbitMQ
npm run docker:down           # Dừng RabbitMQ
npm run docker:logs           # Xem logs RabbitMQ
```

### 🛠️ Utilities

```sh
npm run clean                 # Clean cache và build files
npm run graph                 # Xem project dependency graph
```

## 🔐 API Endpoints

### Authentication Required Endpoints:

- `POST /lesson` - Tạo bài học mới
- `GET /lessons` - Lấy danh sách bài học của user
- `GET /lesson/:id` - Lấy chi tiết bài học
- `GET /my-progress` - Lấy tiến độ học của user

### Public Endpoints:

- `GET /` - Health check

## 📚 Một số lệnh hữu ích

- Build: `npx nx build <project>`
- Test: `npx nx test <project>`
- Xem project graph: `npx nx graph`
- Prisma Studio: `npx prisma studio`

## 🔗 Tích hợp với Frontend

Backend này được thiết kế để tích hợp với [Puchi Frontend](https://github.com/hoan02/puchi) sử dụng:

- **Clerk Authentication**: Xác thực user qua JWT tokens
- **RESTful APIs**: Giao tiếp qua HTTP/HTTPS
- **Real-time updates**: Qua RabbitMQ events

## 📞 Liên hệ & đóng góp

- Nếu có thắc mắc hoặc muốn đóng góp, hãy tạo issue hoặc pull request trên Github!
