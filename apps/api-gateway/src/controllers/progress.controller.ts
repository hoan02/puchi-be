import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AutheliaAuthGuard, CurrentUser, UserAuthPayload, Public } from '@puchi-be/shared';

interface ProgressServiceGrpc {
  getUserProgress(data: { userId: string }): Promise<any>;
}

@Controller('progress')
export class ProgressController {
  private progressServiceGrpc: ProgressServiceGrpc;

  constructor(
    @Inject('PROGRESS_SERVICE') private readonly progressClient: ClientGrpc
  ) {
    this.progressServiceGrpc = this.progressClient.getService<ProgressServiceGrpc>('ProgressService');
  }

  @Get('user-progress')
  @UseGuards(AutheliaAuthGuard)
  async getUserProgress(@CurrentUser() user: UserAuthPayload) {
    const progress = await this.progressServiceGrpc.getUserProgress({ userId: user.id });
    return {
      data: progress,
    };
  }

  @Get('public-stats')
  async getPublicStats() {
    return {
      message: 'Public progress statistics',
      timestamp: new Date().toISOString()
    };
  }
} 