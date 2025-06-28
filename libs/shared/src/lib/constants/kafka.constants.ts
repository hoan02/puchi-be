// Kafka Configuration
export const KAFKA_CONFIG = {
  BROKERS: ['localhost:9092'],
  CLIENT_ID: 'puchi-be',
  GROUP_ID: 'puchi-be-group',
} as const;

// Kafka Topics
export const KAFKA_TOPICS = {
  // Core Learning Events
  USER_LEARNING_EVENTS: 'user-learning-events',
  LESSON_EVENTS: 'lesson-events',
  PROGRESS_EVENTS: 'progress-events',

  // Service-specific Events
  USER_EVENTS: 'user-events',
  MEDIA_EVENTS: 'media-events',
  NOTIFICATION_EVENTS: 'notification-events',
  VOCABULARY_EVENTS: 'vocabulary-events',
  QUIZ_EVENTS: 'quiz-events',
  ANALYTICS_EVENTS: 'analytics-events',

  // ML/AI Events
  ML_LEARNING_EVENTS: 'ml-learning-events',
  RECOMMENDATION_EVENTS: 'recommendation-events',
  FEATURE_EVENTS: 'feature-events',
} as const;

// Kafka Event Types
export const KAFKA_EVENT_TYPES = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Lesson Events
  LESSON_CREATED: 'lesson.created',
  LESSON_UPDATED: 'lesson.updated',
  LESSON_DELETED: 'lesson.deleted',
  LESSON_STARTED: 'lesson.started',
  LESSON_COMPLETED: 'lesson.completed',

  // Progress Events
  PROGRESS_UPDATED: 'progress.updated',
  PROGRESS_COMPLETED: 'progress.completed',

  // Media Events
  MEDIA_PROCESSED: 'media.processed',
  MEDIA_FAILED: 'media.failed',
  MEDIA_UPLOADED: 'media.uploaded',

  // Notification Events
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',

  // Vocabulary Events
  VOCABULARY_ADDED: 'vocabulary.added',
  VOCABULARY_LEARNED: 'vocabulary.learned',

  // Quiz Events
  QUIZ_STARTED: 'quiz.started',
  QUIZ_COMPLETED: 'quiz.completed',
  QUIZ_SCORED: 'quiz.scored',

  // Analytics Events
  ANALYTICS_RECORDED: 'analytics.recorded',
} as const;

// Kafka Consumer Groups
export const KAFKA_CONSUMER_GROUPS = {
  USER_SERVICE: 'user-service-group',
  LESSON_SERVICE: 'lesson-service-group',
  PROGRESS_SERVICE: 'progress-service-group',
  MEDIA_SERVICE: 'media-service-group',
  NOTIFICATION_SERVICE: 'notification-service-group',
  VOCABULARY_SERVICE: 'vocabulary-service-group',
  QUIZ_SERVICE: 'quiz-service-group',
  ANALYTICS_SERVICE: 'analytics-service-group',
} as const; 