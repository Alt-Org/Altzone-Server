import { UnauthorizedException } from '@nestjs/common';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';

export const ThrowAuthErrorIfFound = (): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((resp) => {
          return handler(resp);
        });
      }

      return handler(result);
    };

    return descriptor;
  };
};

function handler(resp: any) {
  if (resp === null)
    throw new UnauthorizedException({
      message: 'Credentials for that profile are incorrect',
      errors: [
        new APIError({
          reason: APIErrorReason.NOT_AUTHENTICATED,
          message: 'Credentials for that profile are incorrect',
        }),
      ],

      statusCode: 401,
      error: 'Unauthorized',
    });

  return resp;
}
