import { AuthorizationInterceptor } from '../../authorization/authorization.interceptor';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { User } from '../../auth/user';
import { createMongoAbility, AbilityBuilder } from '@casl/ability';

describe('AuthorizationInterceptor - Array Payload Handling', () => {
  let interceptor: AuthorizationInterceptor;
  let mockCaslFactory: any;
  let mockReflector: any;

  class TestDto {
    _id!: string;
    name!: string;
  }

  beforeEach(() => {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    can('update_request', TestDto);
    can('read_request', TestDto);
    can('read_response', TestDto);
    can('update_response', TestDto);
    const realAbility = build();

    mockCaslFactory = {
      createForUser: jest.fn().mockResolvedValue(realAbility),
    };

    mockReflector = {
      get: jest.fn().mockReturnValue({
        action: 'update',
        subject: TestDto,
      }),
    };

    interceptor = new AuthorizationInterceptor(mockCaslFactory, mockReflector);
  });

  it('should process single object payloads correctly', async () => {
    const requestBody = { _id: 'room_1', name: 'Living Room' };
    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: requestBody, params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn().mockReturnValue(of({ data: 'ok' })) };

    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);

    result$.subscribe({
      next: () => {
        const request = mockExecutionContext.switchToHttp().getRequest();
        expect(Array.isArray(request.body)).toBe(false);
        expect(request.body._id).toBe('room_1');
      },
    });
  });

  it('should process array payloads without throwing 403 or stripping items', async () => {
    const requestBody = [
      { _id: 'room_1', name: 'Living Room' },
      { _id: 'room_2', name: 'Bedroom' },
    ];

    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: requestBody, params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn().mockReturnValue(of({ data: 'ok' })) };

    const result$ = await interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    result$.subscribe({
      next: () => {
        const request = mockExecutionContext.switchToHttp().getRequest();
        expect(Array.isArray(request.body)).toBe(true);
        expect(request.body.length).toBe(2);
        expect(request.body[0]._id).toBe('room_1');
        expect(request.body[1]._id).toBe('room_2');
      },
    });
  });

  it('should throw ForbiddenException when an item in an array payload fails a permission check', async () => {
    const { build } = new AbilityBuilder(createMongoAbility);
    const restrictAbility = build(); // No permissions granted

    mockCaslFactory.createForUser.mockResolvedValueOnce(restrictAbility);

    const requestBody = [{ _id: 'room_1', name: 'Living Room' }];
    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: requestBody, params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn() };

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when a single object payload fails a permission check', async () => {
    const { build } = new AbilityBuilder(createMongoAbility);
    const restrictAbility = build(); // No permissions granted

    mockCaslFactory.createForUser.mockResolvedValueOnce(restrictAbility);

    const requestBody = { _id: 'room_1', name: 'Living Room' };
    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: requestBody, params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn() };

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should handle non-update actions', async () => {
    mockReflector.get.mockReturnValueOnce({
      action: 'read',
      subject: TestDto,
    });

    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: {}, params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn().mockReturnValue(of({ _id: 'room_1', name: 'Test' })) };

    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);

    result$.subscribe({
      next: (res) => {
        expect(res).toBeDefined();
      },
    });
  });

  it('should process response mapping logic for array responses', async () => {
    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: [], params: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const responseData = [
      { _id: 'room_1', name: 'Living Room' },
      { _id: 'room_2', name: 'Bedroom' },
    ];

    const mockCallHandler = { handle: jest.fn().mockReturnValue(of(responseData)) };

    const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);

    result$.subscribe({
      next: (data) => {
        expect(data).toBeDefined();
      },
    });
  });

  it('should throw InternalServerErrorException if no permission metadata is defined on route', async () => {
    mockReflector.get.mockReturnValueOnce(undefined);

    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser, body: {} }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = { handle: jest.fn() };

    await expect(
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).rejects.toThrow(InternalServerErrorException);
  });
});