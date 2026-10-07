import { CanActivate, Injectable } from '@nestjs/common';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import isTestingSession from '../../box/util/isTestingSession';

/**
 * Blocks normal clan membership mutations while the API is running a Box
 * testing session. Internal Box services do not pass through controller
 * guards and can still create clans and assign tester accounts.
 */
@Injectable()
export class BlockClanMutationInTestingSessionGuard implements CanActivate {
  canActivate(): boolean {
    if (!isTestingSession()) return true;

    throw new APIError({
      reason: APIErrorReason.CLAN_ACTION_BLOCKED_DURING_TESTING_SESSION,
      message: 'Clan action is blocked during a Box testing session',
    });
  }
}
