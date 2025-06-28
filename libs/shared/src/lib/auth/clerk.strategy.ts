import { verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { UserAuthPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<UserAuthPayload> {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });

      // Extract only necessary information from Clerk token
      return {
        id: tokenPayload.sub,
        email: (tokenPayload as any).email || '',
        firstName: (tokenPayload as any).firstName || undefined,
        lastName: (tokenPayload as any).lastName || undefined,
        profileImageUrl: (tokenPayload as any).picture || undefined,
        username: (tokenPayload as any).username || undefined,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}