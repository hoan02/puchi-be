export const QUEUE_LESSON = 'lesson_queue';
export const QUEUE_USER = 'user_queue';
export const QUEUE_PROGRESS = 'progress_queue';
export const QUEUE_MEDIA = 'media_queue';
export const QUEUE_NOTIFICATION = 'notification_queue';
export const QUEUE_VOCABULARY = 'vocabulary_queue';
export const QUEUE_QUIZ = 'quiz_queue';
export const QUEUE_ANALYTICS = 'analytics_queue';

// Event Names
export const EVENTS = {
  // Lesson Events
  LESSON_CREATED: 'lesson.created',
  LESSON_UPDATED: 'lesson.updated',
  LESSON_DELETED: 'lesson.deleted',

  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

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
