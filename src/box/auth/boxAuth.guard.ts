import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { NO_AUTH_REQUIRED } from '../../auth/decorator/NoAuth.decorator';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { envVars } from '../../common/service/envHandler/envVars';
import { BoxUser } from './BoxUser';

/**
 * Auth guard for testing sessions.
 *
 * This guard will add "user" field to request object, which is of type BoxUser instead of standard User.
 *
 * The guard will not add the "user" field if an endpoint or controller is decorated with @NoAuth()
 */
@Injectable()
export class BoxAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const noAuthRequired = this.reflector.getAllAndOverride(NO_AUTH_REQUIRED, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (noAuthRequired) return true;

    const errorResponse = {
      statusCode: 401,
      error: 'Unauthorized',
    };

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token)
      throw new UnauthorizedException({
        ...errorResponse,
        message:
          'The access token is not provided. ' +
          'Please add `authorization` field with access token(in bearer token form): ' +
          '`Bearer access-token-here` to request header. The access token you can get from /auth endpoint',
        errors: [
          new APIError({
            reason: APIErrorReason.NOT_AUTHENTICATED,
            message: 'The access token is not provided',
          }),
        ],
      });

    try {
      const payload: BoxUser = await this.jwtService.verifyAsync(token, {
        secret: envVars.JWT_SECRET,
      });

      const { profile_id, player_id, box_id, groupAdmin } = {
        profile_id: null,
        player_id: null,
        box_id: null,
        groupAdmin: null,
        ...payload,
      };

      if (profile_id && groupAdmin) {
        request['user'] = new BoxUser(payload);
        return true;
      }

      if (profile_id && player_id && !box_id && groupAdmin === null)
        throw new UnauthorizedException({
          ...errorResponse,
          message:
            'Incorrect token provided. Notice that the token should be for the testing session',
          errors: [
            new APIError({
              reason: APIErrorReason.INVALID_AUTH_TOKEN,
              message:
                'Incorrect token provided. Notice that the token should be for the testing session',
            }),
          ],
        });

      if (!profile_id || !player_id || !box_id || groupAdmin === null)
        throw new UnauthorizedException({
          ...errorResponse,
          message: 'Incorrect token provided.',
          errors: [
            new APIError({
              reason: APIErrorReason.INVALID_AUTH_TOKEN,
              message: 'Incorrect token provided.',
            }),
          ],
        });

      request['user'] = new BoxUser(payload);
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;

      throw new UnauthorizedException({
        ...errorResponse,
        message:
          'The access token is expired or invalid. ' +
          'Please update `authorization` field with access token(in bearer token form): ' +
          '`Bearer access-token-here` in your request header. The access token you can get from /auth endpoint',
        errors: [
          new APIError({
            reason: APIErrorReason.AUTHENTICATION_FAILED,
            message: 'The access token is expired or invalid',
          }),
        ],
      });
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
