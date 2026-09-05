import {
  CanActivate,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { envVars } from '../../common/service/envHandler/envVars';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { APIError } from '../../common/controller/APIError';

/**
 * Guard for testing sessions.
 * 
 * Prohibits access to endpoints used in Box related Controllers outside testing.
 */
@Injectable()
export class BoxTestingSessionGuard implements CanActivate {
  public canActivate(): boolean {
    if (envVars.ENVIRONMENT === 'TESTING_SESSION') return true;

    throw new ForbiddenException({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Controller is only available when ENVIRONMENT is TESTING_SESSION',
      errors: [
        new APIError({
          reason: APIErrorReason.NOT_ALLOWED,
          message: 'Controller not available outside testing session',
        }),
      ],
    });
  }
}
