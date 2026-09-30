import { envVars } from '../../../../common/service/envHandler/envVars';
import AuthModule from '../../../../__tests__/auth/modules/auth.module';
import { BoxTestingSessionGuard } from '../../../../box/auth/boxTestingSession.guard';
import { ForbiddenException } from '@nestjs/common';

describe('BoxTestingSessionGuard.canActivate() test suite', () => {
  let guard: BoxTestingSessionGuard;

  beforeEach(async () => {
    guard = await AuthModule.getBoxTestingGuard();
  });

  it('Should return true if ENVIRONMENT is TESTING_SESSION', async () => {
    envVars.ENVIRONMENT = 'TESTING_SESSION';
    const canActivate = guard.canActivate();
    expect(canActivate).toBe(true);
  });

  it('Should throw FORBIDDEN APIError if ENVIRONMENT is not TESTING_SESSION', async () => {
    envVars.ENVIRONMENT = 'PRODUCTION';
    expect(() => guard.canActivate()).toThrow(ForbiddenException);
  });
});
