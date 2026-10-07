import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { APIError } from '../../../common/controller/APIError';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { BlockClanMutationInTestingSessionGuard } from '../../../clan/guard/blockClanMutationInTestingSession.guard';

describe('BlockClanMutationInTestingSessionGuard', () => {
  const guard = new BlockClanMutationInTestingSessionGuard();
  const originalEnvironment = envVars.ENVIRONMENT;

  afterEach(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('allows clan mutations outside a testing session', () => {
    envVars.ENVIRONMENT = Environment.PRODUCTION;

    expect(guard.canActivate()).toBe(true);
  });

  it('blocks clan mutations with a stable error reason during a testing session', () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;

    expect.assertions(3);
    try {
      guard.canActivate();
    } catch (error) {
      const apiError = error as APIError;

      expect(apiError).toMatchObject({
        reason: APIErrorReason.CLAN_ACTION_BLOCKED_DURING_TESTING_SESSION,
        statusCode: 403,
      });
      expect(apiError.message).toBe(
        'Clan action is blocked during a Box testing session',
      );
      expect(apiError.getStatus()).toBe(403);
    }
  });
});
