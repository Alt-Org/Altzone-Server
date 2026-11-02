import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { User } from '../../auth/user';
import { AuthorizationInterceptor } from '../../authorization/authorization.interceptor';
import { Action } from '../../authorization/enum/action.enum';
import { APIErrorReason } from '../../common/controller/APIErrorReason';

describe('AuthorizationInterceptor - _id validation', () => {
  class TestDto {
    _id!: string;
  }

  const validId = '507f1f77bcf86cd799439011';
  let caslAbilityFactory: { createForUser: jest.Mock };
  let reflector: { get: jest.Mock };
  let interceptor: AuthorizationInterceptor;
  let callHandler: CallHandler;

  beforeEach(() => {
    caslAbilityFactory = {
      createForUser: jest.fn().mockResolvedValue({
        can: jest.fn().mockReturnValue(true),
      }),
    };
    reflector = {
      get: jest.fn().mockReturnValue({
        action: Action.delete,
        subject: TestDto,
      }),
    };
    interceptor = new AuthorizationInterceptor(
      caslAbilityFactory as any,
      reflector as any,
    );
    callHandler = { handle: jest.fn().mockReturnValue(of(undefined)) };
  });

  it.each(['12345', 'invalidid'])(
    'returns 400 for malformed _id %s before authorization',
    async (invalidId) => {
      const context = createContext(invalidId);

      await expect(
        interceptor.intercept(context, callHandler),
      ).rejects.toMatchObject({
        status: 400,
      });

      expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
    },
  );

  it('identifies _id and its value in the validation error', async () => {
    const invalidId = 'invalidid';

    try {
      await interceptor.intercept(createContext(invalidId), callHandler);
      fail('Expected interceptor to reject the invalid _id');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as any;
      expect(response.errors[0]).toMatchObject({
        reason: APIErrorReason.VALIDATION,
        field: '_id',
        value: invalidId,
        statusCode: 400,
      });
    }
  });

  it('continues to authorization when _id is valid', async () => {
    await interceptor.intercept(createContext(validId), callHandler);

    expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
      expect.any(User),
      TestDto,
      Action.delete,
      { _id: validId },
    );
  });

  it('returns 400 for a malformed update body _id before authorization', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
    });
    const invalidId = 'invalidid';

    await expect(
      interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), {
          _id: invalidId,
        }),
        callHandler,
      ),
    ).rejects.toMatchObject({ status: 400 });

    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
    expect(callHandler.handle).not.toHaveBeenCalled();
  });

  it('returns 400 if an update body array contains a malformed _id', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
    });
    const invalidId = 'invalidid';

    try {
      await interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), [
          { _id: validId },
          { _id: invalidId },
        ]),
        callHandler,
      );
      fail('Expected interceptor to reject the invalid _id');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as any;
      expect(response.errors[0]).toMatchObject({
        reason: APIErrorReason.VALIDATION,
        field: '_id',
        value: invalidId,
        statusCode: 400,
      });
    }

    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
    expect(callHandler.handle).not.toHaveBeenCalled();
  });

  it('continues to authorization when update body IDs are valid', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
    });
    const body = [{ _id: validId }];
    const authorizationError = new Error('Authorization was called');
    caslAbilityFactory.createForUser.mockRejectedValueOnce(authorizationError);

    await expect(
      interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), body),
        callHandler,
      ),
    ).rejects.toBe(authorizationError);

    expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
      expect.any(User),
      TestDto,
      Action.update,
      body,
    );
  });

  it('checks authentication before validating _id', async () => {
    const context = createContext('invalidid', null);

    await expect(
      interceptor.intercept(context, callHandler),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
  });

  function createContext(
    _id: string | undefined,
    user: User | null = new User('profile-id', 'player-id'),
    body: unknown = {},
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params: { _id }, body }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;
  }
});
