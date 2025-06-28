import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy
  ) { }

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  async getProfile(@CurrentUser() user: UserAuthPayload) {
    // Gửi message sang user-service
    const profile = await this.userClient.send('get-user-profile', { userId: user.userId }).toPromise();
    return { data: profile, timestamp: new Date().toISOString() };
  }

  @Get('public-info')
  @Public()
  async getPublicInfo() {
    return {
      message: 'Public user information',
      timestamp: new Date().toISOString()
    };
  }
} 