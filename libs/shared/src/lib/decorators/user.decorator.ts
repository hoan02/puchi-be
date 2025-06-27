import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload | null => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.auth?.userId) return null;
    return {
      id: req.auth.userId,
      email: req.auth.sessionClaims?.email,
      firstName: req.auth.sessionClaims?.first_name,
      lastName: req.auth.sessionClaims?.last_name,
    };
  },
); 