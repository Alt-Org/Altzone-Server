import { Reflector } from '@nestjs/core';
import AuthModule from '../../modules/auth.module';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../../../auth/auth.guard';
import TestUtilDataFactory from '../../../test_utils/data/TestUtilsDataFactory';
import { User } from '../../../../auth/user';
import { JwtService } from '@nestjs/jwt';
import { APIError } from '../../../../common/controller/APIError';
import { APIErrorReason } from '../../../../common/controller/APIErrorReason';

describe('AuthGuard with ExecutionContextBuilder and RequestBuilder', () => {
  let guard: AuthGuard;
  const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');
  const requestBuilder = TestUtilDataFactory.getBuilder('Request');

  beforeEach(async () => {
    guard = await AuthModule.getAuthGuard();
  });

  it('Should allow access if NO_AUTH_REQUIRED is set', async () => {
    jest
      .spyOn(Reflector.prototype, 'getAllAndOverride')
      .mockReturnValueOnce(true);

    const request = requestBuilder.build();
    const context = contextBuilder.setHttpRequest(request).build();

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('Should allow access and set user on request when token is valid', async () => {
    const request = requestBuilder
      .setHeaders({ authorization: 'Bearer valid-token' })
      .build();

    const context = contextBuilder.setHttpRequest(request).build();

    const payload = { profile_id: '123', player_id: '456' };
    jest.spyOn(JwtService.prototype, 'verifyAsync').mockResolvedValue(payload);

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);

    expect(request['user']).toEqual(new User('123', '456'));
  });

  it('Should throw UnauthorizedException if no authorization header is provided', async () => {
    const request = requestBuilder.setHeaders({}).build();
    const context = contextBuilder.setHttpRequest(request).build();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: {
        statusCode: 401,
        error: 'Unauthorized',
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
      },
    });
  });

  it('Should throw UnauthorizedException if token is invalid or expired', async () => {
    const request = requestBuilder
      .setHeaders({ authorization: 'Bearer invalid-token' })
      .build();

    const context = contextBuilder.setHttpRequest(request).build();

    jest
      .spyOn(JwtService.prototype, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: {
        statusCode: 401,
        error: 'Unauthorized',
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
      },
    });
  });

  it('Should throw UnauthorizedException if token is missing profile_id or player_id', async () => {
    const request = requestBuilder
      .setHeaders({ authorization: 'Bearer invalid-token' })
      .build();

    const context = contextBuilder.setHttpRequest(request).build();

    jest.spyOn(JwtService.prototype, 'verifyAsync').mockResolvedValue({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: {
        statusCode: 401,
        error: 'Unauthorized',
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
      },
    });
  });
});
