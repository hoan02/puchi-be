import { Controller, Get, Inject, UseGuards, Logger } from '@nestjs/common';
import { ClerkAuthGuard, CurrentUser, UserAuthPayload, Public, CLIENT_NAMES } from '@puchi-be/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiResponseDto } from '../dto/lesson.dto';
import { GetUserProfileEvent, UserProfileResponse } from '../events/user.events';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @Inject(CLIENT_NAMES.USER_SERVICE) private readonly userClient: ClientProxy
  ) { }

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  async getProfile(@CurrentUser() user: UserAuthPayload): Promise<ApiResponseDto<UserProfileResponse>> {
    this.logger.log(`Getting profile for user: ${user.id}`);

    try {
      const event: GetUserProfileEvent = { userId: user.id };
      const profile = await firstValueFrom(this.userClient.send('get-user-profile', event));

      this.logger.log(`Retrieved profile for user: ${user.id}`);

      return { 
        data: profile, 
        timestamp: new Date().toISOString() 
      };
    } catch (error) {
      this.logger.error(`Error fetching user profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('public-info')
  @Public()
  async getPublicInfo(): Promise<ApiResponseDto<any>> {
    this.logger.log('Getting public user info');

    return {
      data: { message: 'Public user information' },
      timestamp: new Date().toISOString()
    };
  }
} 