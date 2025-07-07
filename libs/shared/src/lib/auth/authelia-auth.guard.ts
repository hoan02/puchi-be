import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AutheliaAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = {
      id: request.headers['remote-user'],
      email: request.headers['remote-email'],
      name: request.headers['remote-name'],
      groups: request.headers['remote-groups']?.split(',') || [],
    };
    if (!user.id || !user.email) {
      throw new UnauthorizedException('Missing Authelia headers');
    }
    request.user = user;
    return true;
  }
} 