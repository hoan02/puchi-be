import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@puchi-be/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Public()
  getData() {
    return this.appService.getData();
  }

  @Get('api-gateway/status')
  @Public()
  async getApiGatewayStatus() {
    return {
      service: 'api-gateway',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        lessons: '/lessons',
        users: '/users',
        progress: '/progress'
      }
    };
  }
}
