import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import BoxAuthHandler from '../BoxAuthHandler';
import { Reflector } from '@nestjs/core';
import { IS_GROUP_ADMIN } from './IsGroupAdmin';
import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { BoxUser } from '../BoxUser';
import { throwAPIError } from '../../../common/decorator/response/FormatAPIResponse';

/**
 * The class checks whenever the logged-in user a group admin of a testing session based on the provided JWT auth token
 */
@Injectable()
export class GroupAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(BoxAuthHandler) private readonly boxAuthHandler: BoxAuthHandler,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAdmin = this.reflector.get(
      IS_GROUP_ADMIN,
      context.getHandler(),
    );
    if (!requiredAdmin) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (!request['user'])
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHENTICATED,
        message: 'The user must be logged-in',
      });

    if (!(request['user'] instanceof BoxUser))
      throw new APIError({
        reason: APIErrorReason.INVALID_AUTH_TOKEN,
        message: 'The user must have an auth token for the testing session',
      });

    const user = request['user'];

    const [isAdmin, errors] = await this.boxAuthHandler.isGroupAdmin(user);

    if (errors) throwAPIError(errors);

    if (!isAdmin)
      throwAPIError(
        new APIError({
          reason: APIErrorReason.NOT_AUTHORIZED,
          message: 'The logged-in user is not a group admin',
          field: 'groupAdmin',
          value: user.groupAdmin,
        }),
      );

    return true;
  }
}
