import { Controller, Get, Inject, UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public, CLIENT_NAMES } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('progress')
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(
    @Inject(CLIENT_NAMES.PROGRESS_SERVICE) private readonly progressClient: ClientProxy
  ) { }

  @Get('user-progress')
  @UseGuards(ClerkAuthGuard)
  async getUserProgress(@CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting progress for user: ${user.id}`);

    // Gửi message sang progress-service
    const progress = await firstValueFrom(this.progressClient.send('get-user-progress', { userId: user.id }));

    this.logger.log(`Retrieved progress for user: ${user.id}`);

    return { data: progress, timestamp: new Date().toISOString() };
  }

  @Get('public-stats')
  @Public()
  async getPublicStats() {
    this.logger.log('Getting public progress stats');

    return {
      message: 'Public progress statistics',
      timestamp: new Date().toISOString()
    };
  }
} 