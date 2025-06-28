import { Controller, Get, Inject, UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public, CLIENT_NAMES } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(CLIENT_NAMES.USER_SERVICE) private readonly userClient: ClientProxy
  ) { }

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  async getProfile(@CurrentUser() user: UserAuthPayload) {
    this.logger.log(`Getting profile for user: ${user.id}`);

    // Gửi message sang user-service
    const profile = await firstValueFrom(this.userClient.send('get-user-profile', { userId: user.id }));

    this.logger.log(`Retrieved profile for user: ${user.id}`);

    return { data: profile, timestamp: new Date().toISOString() };
  }

  @Get('public-info')
  @Public()
  async getPublicInfo() {
    this.logger.log('Getting public user info');

    return {
      message: 'Public user information',
      timestamp: new Date().toISOString()
    };
  }
} 