# PuchiBe Backend

PuchiBe là hệ thống backend sử dụng kiến trúc microservices, được xây dựng với NestJS, Prisma, RabbitMQ và quản lý bằng Nx Monorepo. Tích hợp với [Puchi Frontend](https://github.com/hoan02/puchi) sử dụng Clerk authentication.

## 🗄️ Database Architecture

Dự án sử dụng **Hybrid Database Architecture** với 3 database được tổ chức theo domain:

- **Core Database** (Port 5432): User, Lesson, Progress services
- **Support Database** (Port 5433): Notification, Analytics services
- **Feature Database** (Port 5434): Media, Vocabulary, Quiz services

Mỗi service có schema riêng trong database tương ứng để đảm bảo tính độc lập và hiệu suất truy vấn.

## 🚀 Công nghệ sử dụng

- **Node.js** + **TypeScript**
- **NestJS** (v11) + **Microservices**
- **Prisma ORM** (Schema per Service)
- **RabbitMQ** (message broker)
- **Clerk** (authentication) - Sử dụng @clerk/backend
- **Nx Monorepo**
- **Jest** (unit test)
- **ESLint, Prettier** (code style)
- **Docker Compose** (chạy RabbitMQ + Databases)

## 🏗️ Kiến trúc tổng quan

### **Services Architecture:**

- **API Gateway** (Port 3000): Entry point cho client, xác thực qua Clerk, forward requests
- **Core Services:**
  - **User Service** (Port 3001): Quản lý thông tin user
  - **Lesson Service** (Port 3002): Quản lý bài học
  - **Progress Service** (Port 3003): Quản lý tiến độ học tập
- **Support Services:**
  - **Notification Service** (Port 3005): Quản lý thông báo, email
  - **Analytics Service** (Port 3008): Phân tích dữ liệu, reporting
- **Feature Services:**
  - **Media Service** (Port 3004): Xử lý audio, video, image
  - **Vocabulary Service** (Port 3006): Quản lý từ vựng, flashcards
  - **Quiz Service** (Port 3007): Quản lý quiz, assessments

### **Shared Library:**

- **Constants**: Microservice names, queue names, database configs
- **DTOs**: Data transfer objects
- **Interfaces**: Type definitions
- **Guards**: Authentication guards
- **Decorators**: Custom decorators
- **Modules**: Shared modules (ClientsModule)

## 📦 Cấu trúc thư mục

```
apps/
  api-gateway/           # API Gateway service
  user-service/          # User management service
  lesson-service/        # Lesson management service
  progress-service/      # Progress tracking service
  media-service/         # Media processing service
  notification-service/  # Notification service
  vocabulary-service/    # Vocabulary management service
  quiz-service/          # Quiz management service
  analytics-service/     # Analytics service
  *-e2e/                # E2E tests
libs/
  shared/               # Shared constants, DTOs, interfaces, guards, decorators
  database/             # Database utilities (legacy)
```

## 🔄 Sơ đồ luồng hoạt động

```mermaid
sequenceDiagram
    participant Client
    participant API-Gateway
    participant Clerk
    participant RabbitMQ
    participant Core-Services
    participant Support-Services
    participant Feature-Services

    Client->>API-Gateway: POST /lesson (with Bearer token)
    API-Gateway->>Clerk: ClerkService.verifyToken()
    Clerk->>API-Gateway: User info via @clerk/backend
    API-Gateway->>RabbitMQ: emit lesson-created (with user data)
    RabbitMQ->>Core-Services: lesson-created event
    Core-Services->>Support-Services: emit analytics event
    Core-Services->>Feature-Services: emit media processing event
    API-Gateway->>Client: Trả về kết quả
```

## ⚙️ Hướng dẫn chạy dự án

### 1. Cài đặt dependencies:

```sh
npm install
```

### 2. Khởi động infrastructure:

```sh
npm run docker:up
```

### 3. Thiết lập database cho từng service:

```sh
# Setup tất cả databases
npm run db:setup:all

# Hoặc setup từng nhóm
npm run db:setup:core      # User, Lesson, Progress
npm run db:setup:support   # Notification, Analytics
npm run db:setup:feature   # Media, Vocabulary, Quiz
```

### 4. Tạo file .env cho từng service:

Copy từ `.env.example` và cập nhật các giá trị thực tế:

```env
# Core Services (user, lesson, progress)
CORE_DATABASE_URL=postgresql://puchi_user:puchi_password@localhost:5432/puchi_core
DB_SCHEMA=user_service
PORT=3001

# Support Services (notification, analytics)
SUPPORT_DATABASE_URL=postgresql://puchi_user:puchi_password@localhost:5433/puchi_support
DB_SCHEMA=notification_service
PORT=3005

# Feature Services (media, vocabulary, quiz)
FEATURE_DATABASE_URL=postgresql://puchi_user:puchi_password@localhost:5434/puchi_feature
DB_SCHEMA=media_service
PORT=3004
```

### 5. Thiết lập Clerk:

1. Đăng ký tài khoản tại [clerk.com](https://clerk.com)
2. Tạo application mới
3. Copy Secret Key vào file `.env` của API Gateway
4. Cấu hình CORS origins cho frontend domain

### 6. Khởi động development servers:

```sh
# Chạy tất cả services
npm run dev

# Hoặc chạy từng nhóm
npm run dev:core      # User, Lesson, Progress
npm run dev:support   # Notification, Analytics
npm run dev:feature   # Media, Vocabulary, Quiz
```

## 📚 Scripts hữu ích

### 🚀 Development

```sh
npm run dev                    # Chạy tất cả services (parallel)
npm run dev:core              # Chạy core services
npm run dev:support           # Chạy support services
npm run dev:feature           # Chạy feature services
npm run dev:gateway           # Chỉ chạy API Gateway
npm run dev:user              # Chỉ chạy User Service
npm run dev:lesson            # Chỉ chạy Lesson Service
# ... tương tự cho các service khác
```

### 🏗️ Build & Production

```sh
npm run build                 # Build tất cả services
npm run build:gateway         # Build API Gateway
npm run build:user            # Build User Service
# ... tương tự cho các service khác
npm run start:prod            # Chạy production mode
```

### 🧪 Testing

```sh
npm run test                  # Test tất cả services
npm run test:gateway          # Test API Gateway
npm run test:user             # Test User Service
# ... tương tự cho các service khác
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
# Setup database cho từng service
npm run db:setup:user         # Setup User Service DB
npm run db:setup:lesson       # Setup Lesson Service DB
npm run db:setup:progress     # Setup Progress Service DB
npm run db:setup:media        # Setup Media Service DB
npm run db:setup:notification # Setup Notification Service DB
npm run db:setup:analytics    # Setup Analytics Service DB
npm run db:setup:vocabulary   # Setup Vocabulary Service DB
npm run db:setup:quiz         # Setup Quiz Service DB

# Setup theo nhóm
npm run db:setup:core         # Setup Core Services
npm run db:setup:support      # Setup Support Services
npm run db:setup:feature      # Setup Feature Services
npm run db:setup:all          # Setup tất cả

# Prisma Studio cho từng service
npm run db:studio:user        # Mở Prisma Studio cho User Service
npm run db:studio:lesson      # Mở Prisma Studio cho Lesson Service
# ... tương tự cho các service khác
```

### 🐳 Docker

```sh
npm run docker:up             # Khởi động RabbitMQ + Databases
npm run docker:down           # Dừng tất cả containers
npm run docker:logs           # Xem logs
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
- `POST /vocabulary` - Thêm từ vựng mới
- `GET /quiz/:id` - Lấy quiz
- `POST /quiz/:id/submit` - Nộp bài quiz

### Public Endpoints:

- `GET /` - Health check

## 📚 Một số lệnh hữu ích

- Build: `npx nx build <project>`
- Test: `npx nx test <project>`
- Xem project graph: `npx nx graph`
- Prisma Studio: `npx prisma studio` (trong thư mục service)

## 🔗 Tích hợp với Frontend

Backend này được thiết kế để tích hợp với [Puchi Frontend](https://github.com/hoan02/puchi) sử dụng:

- **Clerk Authentication**: JWT tokens cho API calls
- **RESTful APIs**: Thông qua API Gateway
- **Real-time updates**: Qua RabbitMQ events
- **File uploads**: Qua Media Service

## 🚀 Deployment

### Production Setup:

1. **Environment Variables**: Cập nhật tất cả `.env` files với production values
2. **Database**: Setup production databases với proper credentials
3. **RabbitMQ**: Setup production RabbitMQ cluster
4. **Clerk**: Cập nhật production Clerk keys
5. **Build**: `npm run build`
6. **Start**: `npm run start:prod`

### Docker Deployment:

```sh
# Build images
docker build -t puchi-be-api-gateway apps/api-gateway
docker build -t puchi-be-user-service apps/user-service
# ... tương tự cho các service khác

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Liên hệ & đóng góp

- Nếu có thắc mắc hoặc muốn đóng góp, hãy tạo issue hoặc pull request trên Github!
