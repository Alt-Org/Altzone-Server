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
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

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

  it('continues to the endpoint for a valid authorized update', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
    });
    const { can, build } = new AbilityBuilder(createMongoAbility);
    can(Action.update_request, TestDto);
    caslAbilityFactory.createForUser.mockResolvedValueOnce(build());

    await interceptor.intercept(
      createContext(undefined, new User('profile-id', 'player-id'), {
        _id: validId,
      }),
      callHandler,
    );

    expect(callHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('validates additional update body ID fields from metadata', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
      mongoIdFields: ['owner_id'],
    });
    const invalidId = 'invalid-owner-id';

    try {
      await interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), {
          _id: validId,
          owner_id: invalidId,
        }),
        callHandler,
      );
      fail('Expected interceptor to reject the invalid owner_id');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as any;
      expect(response.errors[0]).toMatchObject({
        reason: APIErrorReason.VALIDATION,
        field: 'owner_id',
        value: invalidId,
        statusCode: 400,
      });
    }

    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
  });

  it('allows null for an explicitly nullable metadata ID field', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
      mongoIdFields: [{ field: 'owner_id', allowNull: true }],
    });
    const authorizationError = new Error('Authorization was called');
    caslAbilityFactory.createForUser.mockRejectedValueOnce(authorizationError);

    await expect(
      interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), {
          _id: validId,
          owner_id: null,
        }),
        callHandler,
      ),
    ).rejects.toBe(authorizationError);

    expect(caslAbilityFactory.createForUser).toHaveBeenCalled();
  });

  it('rejects null for a metadata ID field by default', async () => {
    reflector.get.mockReturnValue({
      action: Action.update,
      subject: TestDto,
      mongoIdFields: ['owner_id'],
    });

    await expect(
      interceptor.intercept(
        createContext(undefined, new User('profile-id', 'player-id'), {
          _id: validId,
          owner_id: null,
        }),
        callHandler,
      ),
    ).rejects.toMatchObject({ status: 400 });

    expect(caslAbilityFactory.createForUser).not.toHaveBeenCalled();
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
