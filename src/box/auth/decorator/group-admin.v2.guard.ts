import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { BoxUser } from '../BoxUser';
import { throwAPIError } from '../../../common/interceptor/response/FormatAPIResponse';

/**
 * The class checks whenever the logged-in user a group admin of a testing session based on the provided JWT auth token
 */
@Injectable()
export class v2GroupAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as BoxUser;

    if (!user?.groupAdmin) {
      throwAPIError(
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          message:
            'The logged-in user must be a group admin / teacher profile.',
        }),
      );
    }

    return true;
  }
}
