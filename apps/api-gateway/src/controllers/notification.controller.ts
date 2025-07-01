import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface NotificationServiceGrpc {
  sendNotification(data: { userId: string, message: string }): Promise<{ success: boolean; error: string }>;
}

@Controller('notification')
export class NotificationController implements OnModuleInit {
  private notificationServiceGrpc: NotificationServiceGrpc;

  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientGrpc
  ) { }

  async onModuleInit() {
    this.notificationServiceGrpc = this.notificationClient.getService<NotificationServiceGrpc>('NotificationService');
  }

  @Post('send')
  async sendNotification(@Body() body: { userId: string; message: string }) {
    const result = await this.notificationServiceGrpc.sendNotification(body);
    return {
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 