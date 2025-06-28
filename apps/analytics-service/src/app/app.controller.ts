import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaService, KAFKA_TOPICS, KAFKA_EVENT_TYPES } from '@puchi-be/shared';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Get()
  getData(): { message: string } {
    return this.appService.getData();
  }

  @MessagePattern(KAFKA_TOPICS.ANALYTICS_EVENTS)
  async handleAnalyticsEvent(@Payload() data: any) {
    console.log('Analytics Service received event:', data);

    // Process analytics event
    const result = await this.appService.processAnalyticsEvent(data);

    // Publish processed analytics
    await this.kafkaService.publishAnalyticsEvent({
      event: KAFKA_EVENT_TYPES.ANALYTICS_RECORDED,
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  @MessagePattern(KAFKA_TOPICS.USER_LEARNING_EVENTS)
  async handleUserLearningEvent(@Payload() data: any) {
    console.log('Analytics Service received user learning event:', data);

    // Process user learning analytics
    const analytics = await this.appService.processUserLearningEvent(data);

    return analytics;
  }
}
