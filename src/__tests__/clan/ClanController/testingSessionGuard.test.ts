import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ClanController } from '../../../clan/clan.controller';
import { BlockClanMutationInTestingSessionGuard } from '../../../clan/guard/blockClanMutationInTestingSession.guard';

describe('ClanController testing-session mutation guards', () => {
  const protectedMethods: (keyof ClanController)[] = [
    'create',
    'delete',
    'createJoin',
    'leaveClan',
    'excludePlayer',
  ];

  it.each(protectedMethods)(
    'protects %s before the controller method can cause side effects',
    (methodName: keyof ClanController) => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        ClanController.prototype[methodName],
      );

      expect(guards).toContain(BlockClanMutationInTestingSessionGuard);
    },
  );
});
