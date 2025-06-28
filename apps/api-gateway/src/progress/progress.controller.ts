import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';

@Controller('progress')
export class ProgressController {
  constructor(
    @Inject('PROGRESS_SERVICE') private readonly progressClient: ClientProxy
  ) { }

  @Get('my')
  @UseGuards(ClerkAuthGuard)
  async getMyProgress(@CurrentUser() user: UserAuthPayload) {
    // Gửi message sang progress-service
    const progress = await this.progressClient.send('get-user-progress', { userId: user.userId }).toPromise();
    return { data: progress, timestamp: new Date().toISOString() };
  }
} 