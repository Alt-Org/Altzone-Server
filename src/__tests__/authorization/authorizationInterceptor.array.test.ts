import { AuthorizationInterceptor } from '../../authorization/authorization.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { User } from '../../auth/user';
import { createMongoAbility, AbilityBuilder } from '@casl/ability';

describe('AuthorizationInterceptor - Array Payload Handling', () => {
  let interceptor: AuthorizationInterceptor;
  let mockCaslFactory: any;
  let mockReflector: any;

  // Define the DTO class for the test
  class TestDto {
    _id!: string;
    name!: string;
  }

  beforeEach(() => {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    
    // Grant permissions here for the test user
    can('update_request', TestDto);
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

  it('should process array payloads without throwing 403 or stripping items', async () => {
    const requestBody = [
      { _id: 'room_1', name: 'Living Room' },
      { _id: 'room_2', name: 'Bedroom' },
    ];

    const mockUser = new User('mock_profile_id', 'mock_player_id', 'mock_clan_id');

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
          body: requestBody,
          params: {},
        }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'ok' })),
    };

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
});