import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';
import { KAFKA_CONFIG, KAFKA_TOPICS } from '../constants';

export interface KafkaEvent {
  event: string;
  data: any;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CONFIG.CLIENT_ID,
      brokers: [...KAFKA_CONFIG.BROKERS],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  // Producer methods
  async publishEvent(topic: string, event: KafkaEvent): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.userId || 'system',
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  async publishUserLearningEvent(event: KafkaEvent): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.USER_LEARNING_EVENTS, event);
  }

  async publishLessonEvent(event: KafkaEvent): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.LESSON_EVENTS, event);
  }

  async publishProgressEvent(event: KafkaEvent): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.PROGRESS_EVENTS, event);
  }

  async publishAnalyticsEvent(event: KafkaEvent): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.ANALYTICS_EVENTS, event);
  }

  // Consumer methods
  async createConsumer(
    groupId: string,
    topics: string[],
    handler: (message: KafkaMessage) => Promise<void>
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          await handler(message);
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
          // In production, you might want to implement dead letter queue
        }
      },
    });

    this.consumers.set(groupId, consumer);
  }

  async disconnectConsumer(groupId: string): Promise<void> {
    const consumer = this.consumers.get(groupId);
    if (consumer) {
      await consumer.disconnect();
      this.consumers.delete(groupId);
    }
  }
} 