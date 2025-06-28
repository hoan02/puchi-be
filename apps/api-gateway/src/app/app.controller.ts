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

  @Get('health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway'
    };
  }
}
