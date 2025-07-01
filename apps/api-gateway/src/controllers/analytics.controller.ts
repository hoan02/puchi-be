import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface AnalyticsServiceGrpc {
  trackEvent(data: { userId: string, eventName: string, eventData: string }): Promise<{ success: boolean; error: string }>;
}

@Controller('analytics')
export class AnalyticsController implements OnModuleInit {
  private analyticsServiceGrpc: AnalyticsServiceGrpc;

  constructor(
    @Inject('ANALYTICS_SERVICE') private readonly analyticsClient: ClientGrpc
  ) { }

  async onModuleInit() {
    this.analyticsServiceGrpc = this.analyticsClient.getService<AnalyticsServiceGrpc>('AnalyticsService');
  }

  @Post('track')
  async trackEvent(@Body() body: { userId: string; eventName: string; eventData: string }) {
    const result = await this.analyticsServiceGrpc.trackEvent(body);
    return {
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 