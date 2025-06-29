# 📝 Logging Guidelines

## Tổng quan

Tài liệu này mô tả cách sử dụng logging trong hệ thống Puchi Backend để đảm bảo logs có cấu trúc, dễ debug và phù hợp với production.

## 🎯 Mục tiêu

- **Structured Logging**: Logs có cấu trúc JSON để dễ parse và search
- **Context Rich**: Mỗi log entry chứa đầy đủ context cần thiết
- **Performance Monitoring**: Theo dõi performance của các operation
- **Error Tracking**: Debug errors một cách hiệu quả
- **Business Analytics**: Phân tích user behavior và business metrics

## 🛠️ Cách sử dụng

### 1. Import Logger

```typescript
import { createLogger, logError, logUserAction, logApiRequest } from '@puchi-be/shared';
```

### 2. Tạo Logger Instance

```typescript
export class UserController {
  private readonly logger = createLogger('UserController');

  // Hoặc với trace ID cho distributed tracing
  private readonly logger = createLogger('UserController').withTrace(traceId);
}
```

### 3. Log Levels

```typescript
// Error - Lỗi nghiêm trọng cần xử lý ngay
logger.error('Database connection failed', {
  error: error.message,
  database: 'postgres',
  retryAttempt: 3,
});

// Warn - Cảnh báo nhưng không ảnh hưởng đến hoạt động
logger.warn('High memory usage detected', {
  memoryUsage: '85%',
  threshold: '80%',
});

// Info - Thông tin quan trọng về business flow
logger.info('User profile retrieved', {
  userId: user.id,
  duration: '150ms',
});

// Debug - Thông tin chi tiết cho development
logger.debug('Processing request', {
  requestId: req.id,
  method: 'GET',
  url: '/api/users/profile',
});
```

## 📋 Logging Patterns

### 1. API Request Logging

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: UserAuthPayload) {
  const startTime = Date.now();

  this.logger.info('Getting user profile', {
    userId: user.id,
    endpoint: '/api/users/profile'
  });

  try {
    const result = await this.userService.getProfile(user.id);
    const duration = Date.now() - startTime;

    logApiRequest(this.logger, 'GET', '/api/users/profile', duration, 200, {
      userId: user.id
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(this.logger, error, {
      userId: user.id,
      endpoint: '/api/users/profile',
      duration: `${duration}ms`
    });

    throw error;
  }
}
```

### 2. User Action Logging

```typescript
async completeLesson(userId: string, lessonId: string, score: number) {
  this.logger.info('User completing lesson', {
    userId,
    lessonId,
    score
  });

  try {
    const result = await this.lessonService.complete(userId, lessonId, score);

    logUserAction(this.logger, userId, 'lesson_completed', {
      lessonId,
      score,
      duration: result.duration,
      success: true
    });

    return result;
  } catch (error) {
    logUserAction(this.logger, userId, 'lesson_completed', {
      lessonId,
      score,
      success: false,
      error: error.message
    });

    throw error;
  }
}
```

### 3. Database Operation Logging

```typescript
async findUserById(userId: string) {
  const startTime = Date.now();

  try {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    const duration = Date.now() - startTime;

    logDatabaseOperation(this.logger, 'SELECT', 'users', duration, {
      userId,
      rowsReturned: user ? 1 : 0
    });

    return user;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(this.logger, error, {
      operation: 'database_query',
      table: 'users',
      userId,
      duration: `${duration}ms`
    });

    throw error;
  }
}
```

### 4. Microservice Communication Logging

```typescript
async getUserProfile(userId: string) {
  this.logger.info('Sending request to user service', {
    userId,
    pattern: 'get-user-profile',
    service: 'user-service'
  });

  try {
    const userClient = this.kafkaClientService.getUserClient();
    const profile = await firstValueFrom(
      userClient.send('get-user-profile', { userId })
    );

    this.logger.info('Received response from user service', {
      userId,
      pattern: 'get-user-profile',
      profileId: profile.id
    });

    return profile;
  } catch (error) {
    logError(this.logger, error, {
      operation: 'microservice_communication',
      targetService: 'user-service',
      pattern: 'get-user-profile',
      userId
    });

    throw error;
  }
}
```

## 🔍 Context Fields

### Common Context Fields

```typescript
{
  // User context
  userId: string,
  userEmail?: string,

  // Request context
  requestId: string,
  traceId: string,
  endpoint: string,
  method: string,

  // Performance context
  duration: string, // "150ms"
  startTime: number,

  // Business context
  action: string,
  resourceId: string,
  success: boolean,

  // Error context
  error: string,
  stack: string,
  code?: string,

  // Environment context
  service: string,
  environment: string,
  version: string
}
```

### Service-Specific Context

```typescript
// User Service
{
  profileId: string,
  userType: 'premium' | 'free',
  registrationDate: string
}

// Lesson Service
{
  lessonId: string,
  lessonType: 'vocabulary' | 'grammar',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  score: number
}

// Payment Service
{
  paymentId: string,
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed'
}
```

## 🚨 Error Logging Best Practices

### 1. Always Include Context

```typescript
// ❌ Không tốt
logger.error('Database error');

// ✅ Tốt
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  database: 'postgres',
  host: 'localhost:5432',
  userId: user.id,
  operation: 'user_profile_query',
});
```

### 2. Use Specific Error Types

```typescript
// ❌ Không tốt
catch (error) {
  logger.error('Error occurred', { error: error.message });
}

// ✅ Tốt
catch (error) {
  if (error instanceof DatabaseConnectionError) {
    logger.error('Database connection failed', {
      error: error.message,
      retryAttempt: error.retryAttempt,
      database: error.database
    });
  } else if (error instanceof ValidationError) {
    logger.warn('Validation failed', {
      error: error.message,
      field: error.field,
      value: error.value
    });
  } else {
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
  }
}
```

### 3. Don't Log Sensitive Information

```typescript
// ❌ Không tốt - Log sensitive data
logger.info('User login', {
  email: user.email,
  password: user.password, // NEVER!
  token: user.token,
});

// ✅ Tốt - Log safe data
logger.info('User login', {
  userId: user.id,
  email: user.email, // OK if not sensitive
  loginMethod: 'email',
  success: true,
});
```

## 📊 Performance Logging

### 1. Operation Timing

```typescript
async performOperation() {
  const startTime = Date.now();

  try {
    const result = await this.someAsyncOperation();
    const duration = Date.now() - startTime;

    this.logger.info('Operation completed', {
      operation: 'some_operation',
      duration: `${duration}ms`,
      success: true
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    this.logger.error('Operation failed', {
      operation: 'some_operation',
      duration: `${duration}ms`,
      error: error.message
    });

    throw error;
  }
}
```

### 2. Batch Operations

```typescript
async processBatch(items: any[]) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      await this.processItem(item);
      successCount++;
    } catch (error) {
      errorCount++;
      this.logger.error('Item processing failed', {
        itemId: item.id,
        error: error.message
      });
    }
  }

  const duration = Date.now() - startTime;

  this.logger.info('Batch processing completed', {
    totalItems: items.length,
    successCount,
    errorCount,
    duration: `${duration}ms`,
    avgDuration: `${duration / items.length}ms`
  });
}
```

## 🔗 Distributed Tracing

### 1. Trace ID Propagation

```typescript
// Middleware để tạo trace ID
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] || generateTraceId();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
});

// Sử dụng trong controller
@Get('profile')
async getProfile(@Req() req: Request, @CurrentUser() user: UserAuthPayload) {
  const logger = createLogger('UserController').withTrace(req.traceId);

  logger.info('Getting user profile', {
    userId: user.id,
    traceId: req.traceId
  });

  // ... rest of the code
}
```

### 2. Microservice Tracing

```typescript
async callUserService(userId: string, traceId: string) {
  const logger = createLogger('ApiGateway').withTrace(traceId);

  logger.info('Calling user service', {
    userId,
    traceId,
    targetService: 'user-service'
  });

  const userClient = this.kafkaClientService.getUserClient();
  const profile = await firstValueFrom(
    userClient.send('get-user-profile', { userId, traceId })
  );

  logger.info('User service response received', {
    userId,
    traceId,
    profileId: profile.id
  });

  return profile;
}
```

## 📈 Business Analytics Logging

### 1. User Behavior Events

```typescript
// User completed a lesson
logger.info('Lesson completed', {
  event: 'lesson_completed',
  userId: user.id,
  lessonId: lesson.id,
  score: 85,
  duration: 1200, // seconds
  completedAt: new Date().toISOString(),
  metrics: {
    lessonsCompleted: user.lessonsCompleted + 1,
    totalScore: user.totalScore + 85,
    streak: user.streak + 1,
  },
});

// User made a purchase
logger.info('Purchase completed', {
  event: 'purchase_completed',
  userId: user.id,
  productId: product.id,
  amount: 29.99,
  currency: 'USD',
  paymentMethod: 'credit_card',
  metrics: {
    totalPurchases: user.totalPurchases + 1,
    totalSpent: user.totalSpent + 29.99,
  },
});
```

### 2. System Health Events

```typescript
// High CPU usage
logger.warn('High CPU usage detected', {
  event: 'system_health_warning',
  metric: 'cpu_usage',
  value: 85,
  threshold: 80,
  unit: 'percent',
  timestamp: new Date().toISOString(),
});

// Database slow query
logger.warn('Slow database query detected', {
  event: 'slow_query_warning',
  query: 'SELECT * FROM users WHERE email = ?',
  duration: 2500,
  threshold: 1000,
  table: 'users',
  rowsReturned: 1,
});
```

## 🛡️ Security Logging

### 1. Authentication Events

```typescript
// Successful login
logger.info('User login successful', {
  event: 'login_success',
  userId: user.id,
  loginMethod: 'email',
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString(),
});

// Failed login attempt
logger.warn('Failed login attempt', {
  event: 'login_failed',
  email: email, // OK to log email for security
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  reason: 'invalid_password',
  timestamp: new Date().toISOString(),
});
```

### 2. Authorization Events

```typescript
// Access denied
logger.warn('Access denied', {
  event: 'access_denied',
  userId: user.id,
  resource: '/api/admin/users',
  reason: 'insufficient_permissions',
  ipAddress: req.ip,
  timestamp: new Date().toISOString(),
});
```

## 📋 Checklist

### Trước khi commit code:

- [ ] Tất cả logs đều có context đầy đủ
- [ ] Không log sensitive information
- [ ] Sử dụng đúng log level
- [ ] Include timing cho performance-critical operations
- [ ] Error logs có stack trace và context
- [ ] Business events được log với metrics
- [ ] Trace ID được propagate qua microservices

### Production deployment:

- [ ] Logs được gửi đến log aggregation system (ELK, CloudWatch, etc.)
- [ ] Log retention policy được cấu hình
- [ ] Log level được set phù hợp với environment
- [ ] Monitoring alerts được setup cho error logs
- [ ] Performance metrics được track từ logs

## 🔧 Configuration

### Environment Variables

```bash
# Log level
LOG_LEVEL=info # debug, info, warn, error

# Service name
SERVICE_NAME=api-gateway

# Environment
NODE_ENV=production

# Log format
LOG_FORMAT=json # json, text
```

### Log Rotation

```bash
# Log files được rotate hàng ngày
# Giữ logs trong 30 ngày
# Compress logs cũ
```

## 📚 References

- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Structured Logging Best Practices](https://www.datadoghq.com/blog/engineering/structured-logging/)
- [Distributed Tracing](https://opentracing.io/docs/overview/)
