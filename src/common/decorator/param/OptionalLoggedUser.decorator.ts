import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../../auth/user';

/**
 * Returns the authenticated user when one is available, or undefined for an
 * anonymous request to an endpoint decorated with @OptionalAuth().
 */
export const OptionalLoggedUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | undefined => {
    const request = context.switchToHttp().getRequest<Request>();
    return request['user'];
  },
);
