import { KafkaOptions, Transport } from '@nestjs/microservices';

const brokers = (process.env['KAFKA_BROKERS'] || 'kafka:9092').split(',');

export const CLIENT_KAFKA_NAMES = {
  API_GATEWAY_CLIENT: 'API_GATEWAY_CLIENT',
  USER_CLIENT: 'USER_CLIENT',
  LESSON_CLIENT: 'LESSON_CLIENT',
  PROGRESS_CLIENT: 'PROGRESS_CLIENT',
  MEDIA_CLIENT: 'MEDIA_CLIENT',
  NOTIFICATION_CLIENT: 'NOTIFICATION_CLIENT',
  VOCABULARY_CLIENT: 'VOCABULARY_CLIENT',
  QUIZ_CLIENT: 'QUIZ_CLIENT',
  ANALYTICS_CLIENT: 'ANALYTICS_CLIENT',
}

export const API_GATEWAY_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
  },
};

export const USER_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'user-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const LESSON_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'lesson-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const PROGRESS_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'progress-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const MEDIA_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'media-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const NOTIFICATION_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'notification-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const VOCABULARY_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'vocabulary-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const QUIZ_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'quiz-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const ANALYTICS_CLIENT_KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers,
    },
    consumer: {
      groupId: 'analytics-service-group',
      allowAutoTopicCreation: true,
    },
  }
};

export const API_GATEWAY_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.API_GATEWAY_CLIENT,
  ...API_GATEWAY_CLIENT_KAFKA_OPTIONS
}

export const USER_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.USER_CLIENT,
  ...USER_CLIENT_KAFKA_OPTIONS
}

export const LESSON_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.LESSON_CLIENT,
  ...LESSON_CLIENT_KAFKA_OPTIONS
}

export const PROGRESS_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.PROGRESS_CLIENT,
  ...PROGRESS_CLIENT_KAFKA_OPTIONS
}

export const MEDIA_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.MEDIA_CLIENT,
  ...MEDIA_CLIENT_KAFKA_OPTIONS
}

export const NOTIFICATION_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.NOTIFICATION_CLIENT,
  ...NOTIFICATION_CLIENT_KAFKA_OPTIONS
}

export const VOCABULARY_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.VOCABULARY_CLIENT,
  ...VOCABULARY_CLIENT_KAFKA_OPTIONS
}

export const QUIZ_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.QUIZ_CLIENT,
  ...QUIZ_CLIENT_KAFKA_OPTIONS
}

export const ANALYTICS_CLIENT_KAFKA_MODULE = {
  name: CLIENT_KAFKA_NAMES.ANALYTICS_CLIENT,
  ...ANALYTICS_CLIENT_KAFKA_OPTIONS
}

// ===================== KAFKA CLIENT CONSTANTS =====================
// File này chỉ dùng cho cấu hình Kafka client/module cho các service sử dụng event bất đồng bộ (Kafka)
// Nếu service không dùng Kafka thì không cần import file này
