// ClientsModule Configuration
export const CLIENTS_CONFIG = {
  // RabbitMQ Configuration
  RABBITMQ: {
    name: 'RABBITMQ_CLIENT',
    transport: 'amqp',
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'main_queue',
      queueOptions: {
        durable: true,
      },
    },
  },

  // Service Clients Configuration
  SERVICES: {
    USER_SERVICE: {
      name: 'USER_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'user_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    LESSON_SERVICE: {
      name: 'LESSON_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'lesson_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    PROGRESS_SERVICE: {
      name: 'PROGRESS_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'progress_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    MEDIA_SERVICE: {
      name: 'MEDIA_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'media_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    NOTIFICATION_SERVICE: {
      name: 'NOTIFICATION_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'notification_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    VOCABULARY_SERVICE: {
      name: 'VOCABULARY_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'vocabulary_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    QUIZ_SERVICE: {
      name: 'QUIZ_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'quiz_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
    ANALYTICS_SERVICE: {
      name: 'ANALYTICS_SERVICE_CLIENT',
      transport: 'amqp',
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'analytics_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  },
} as const;

// Client Names for injection
export const CLIENT_NAMES = {
  RABBITMQ: 'RABBITMQ_CLIENT',
  USER_SERVICE: 'USER_SERVICE_CLIENT',
  LESSON_SERVICE: 'LESSON_SERVICE_CLIENT',
  PROGRESS_SERVICE: 'PROGRESS_SERVICE_CLIENT',
  MEDIA_SERVICE: 'MEDIA_SERVICE_CLIENT',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE_CLIENT',
  VOCABULARY_SERVICE: 'VOCABULARY_SERVICE_CLIENT',
  QUIZ_SERVICE: 'QUIZ_SERVICE_CLIENT',
  ANALYTICS_SERVICE: 'ANALYTICS_SERVICE_CLIENT',
} as const; 