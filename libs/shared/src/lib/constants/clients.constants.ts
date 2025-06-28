// Kafka Configuration
export const KAFKA_CLIENTS_CONFIG = {
  // Service Clients Configuration
  SERVICES: {
    USER_SERVICE: {
      name: 'USER_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'user-service-client',
        },
        consumer: {
          groupId: 'user-service-group',
        },
      },
    },
    LESSON_SERVICE: {
      name: 'LESSON_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'lesson-service-client',
        },
        consumer: {
          groupId: 'lesson-service-group',
        },
      },
    },
    PROGRESS_SERVICE: {
      name: 'PROGRESS_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'progress-service-client',
        },
        consumer: {
          groupId: 'progress-service-group',
        },
      },
    },
    MEDIA_SERVICE: {
      name: 'MEDIA_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'media-service-client',
        },
        consumer: {
          groupId: 'media-service-group',
        },
      },
    },
    NOTIFICATION_SERVICE: {
      name: 'NOTIFICATION_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'notification-service-client',
        },
        consumer: {
          groupId: 'notification-service-group',
        },
      },
    },
    VOCABULARY_SERVICE: {
      name: 'VOCABULARY_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'vocabulary-service-client',
        },
        consumer: {
          groupId: 'vocabulary-service-group',
        },
      },
    },
    QUIZ_SERVICE: {
      name: 'QUIZ_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'quiz-service-client',
        },
        consumer: {
          groupId: 'quiz-service-group',
        },
      },
    },
    ANALYTICS_SERVICE: {
      name: 'ANALYTICS_SERVICE_CLIENT',
      transport: 'kafka',
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'analytics-service-client',
        },
        consumer: {
          groupId: 'analytics-service-group',
        },
      },
    },
  },
} as const;

// Client Names for injection
export const CLIENT_NAMES = {
  USER_SERVICE: 'USER_SERVICE_CLIENT',
  LESSON_SERVICE: 'LESSON_SERVICE_CLIENT',
  PROGRESS_SERVICE: 'PROGRESS_SERVICE_CLIENT',
  MEDIA_SERVICE: 'MEDIA_SERVICE_CLIENT',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE_CLIENT',
  VOCABULARY_SERVICE: 'VOCABULARY_SERVICE_CLIENT',
  QUIZ_SERVICE: 'QUIZ_SERVICE_CLIENT',
  ANALYTICS_SERVICE: 'ANALYTICS_SERVICE_CLIENT',
} as const; 