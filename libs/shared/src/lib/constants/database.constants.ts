// Database Configuration - Hybrid Approach
export const DATABASE_CONFIG = {
  CORE: {
    DATABASE_URL: 'CORE_DATABASE_URL',
    DATABASE_NAME: 'puchi_core',
    PORT: 5432,
    SCHEMAS: {
      USER: 'user_service',
      LESSON: 'lesson_service',
      PROGRESS: 'progress_service',
    },
    SERVICES: ['USER_SERVICE', 'LESSON_SERVICE', 'PROGRESS_SERVICE'],
  },
  SUPPORT: {
    DATABASE_URL: 'SUPPORT_DATABASE_URL',
    DATABASE_NAME: 'puchi_support',
    PORT: 5433,
    SCHEMAS: {
      NOTIFICATION: 'notification_service',
      ANALYTICS: 'analytics_service',
    },
    SERVICES: ['NOTIFICATION_SERVICE', 'ANALYTICS_SERVICE'],
  },
  FEATURE: {
    DATABASE_URL: 'FEATURE_DATABASE_URL',
    DATABASE_NAME: 'puchi_feature',
    PORT: 5434,
    SCHEMAS: {
      MEDIA: 'media_service',
      VOCABULARY: 'vocabulary_service',
      QUIZ: 'quiz_service',
    },
    SERVICES: ['MEDIA_SERVICE', 'VOCABULARY_SERVICE', 'QUIZ_SERVICE'],
  },
} as const;

// Database Connection Strings (Development)
export const DATABASE_URLS = {
  CORE: 'postgresql://puchi_user:puchi_password@localhost:5432/puchi_core',
  SUPPORT: 'postgresql://puchi_user:puchi_password@localhost:5433/puchi_support',
  FEATURE: 'postgresql://puchi_user:puchi_password@localhost:5434/puchi_feature',
} as const;

// Service to Database Mapping
export const SERVICE_DATABASE_MAPPING = {
  USER_SERVICE: 'CORE',
  LESSON_SERVICE: 'CORE',
  PROGRESS_SERVICE: 'CORE',
  NOTIFICATION_SERVICE: 'SUPPORT',
  ANALYTICS_SERVICE: 'SUPPORT',
  MEDIA_SERVICE: 'FEATURE',
  VOCABULARY_SERVICE: 'FEATURE',
  QUIZ_SERVICE: 'FEATURE',
} as const;

// Database Performance Configuration
export const DATABASE_PERFORMANCE_CONFIG = {
  CORE: {
    maxConnections: 200,
    sharedBuffers: '256MB',
    effectiveCacheSize: '1GB',
    workMem: '4MB',
    maintenanceWorkMem: '64MB',
  },
  SUPPORT: {
    maxConnections: 100,
    sharedBuffers: '128MB',
    effectiveCacheSize: '512MB',
    workMem: '2MB',
    maintenanceWorkMem: '32MB',
  },
  FEATURE: {
    maxConnections: 50,
    sharedBuffers: '64MB',
    effectiveCacheSize: '256MB',
    workMem: '1MB',
    maintenanceWorkMem: '16MB',
  },
} as const; 