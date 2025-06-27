import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { requireAuth } from '@clerk/express';

@Injectable()
export class ClerkGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    try {
      await new Promise((resolve, reject) => {
        requireAuth()(req, {} as any, (err: any) => (err ? reject(err) : resolve(true)));
      });
      return true;
    } catch (err) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
} 