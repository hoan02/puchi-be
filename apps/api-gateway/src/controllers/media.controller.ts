import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface MediaServiceGrpc {
  uploadMedia(data: { userId: string, fileName: string, fileData: Buffer }): Promise<{ success: boolean; url: string; error: string }>;
}

@Controller('media')
export class MediaController implements OnModuleInit {
  private mediaServiceGrpc: MediaServiceGrpc;

  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientGrpc
  ) { }

  async onModuleInit() {
    this.mediaServiceGrpc = this.mediaClient.getService<MediaServiceGrpc>('MediaService');
  }

  @Post('upload')
  async uploadMedia(@Body() body: { userId: string; fileName: string; fileData: Buffer }) {
    const result = await this.mediaServiceGrpc.uploadMedia(body);
    return {
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 