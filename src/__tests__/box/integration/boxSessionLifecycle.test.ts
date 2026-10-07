import { ObjectId } from 'mongodb';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { BlockClanMutationInTestingSessionGuard } from '../../../clan/guard/blockClanMutationInTestingSession.guard';
import { BOX_SESSION_TASK_COUNT } from '../../../box/consts/boxSessionConstants';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { UITaskName } from '../../../dailyTasks/enum/uiTaskName.enum';
import BoxModule from '../modules/box.module';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ProfileModule from '../../profile/modules/profile.module';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import DailyTasksModule from '../../dailyTasks/modules/dailyTasks.module';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';

jest.setTimeout(30_000);

describe('Box session lifecycle', () => {
  const originalEnvironment = envVars.ENVIRONMENT;
  const boxModel = BoxModule.getBoxModel();
  const playerModel = PlayerModule.getPlayerModel();
  const profileModel = ProfileModule.getProfileModel();
  const clanModel = ClanModule.getClanModel();
  const dailyTaskModel = DailyTasksModule.getDailyTaskModel();
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();

  beforeAll(async () => {
    envVars.ENVIRONMENT = Environment.TESTING_SESSION;
    await soulHomeModel.init();
  });

  afterAll(() => {
    envVars.ENVIRONMENT = originalEnvironment;
  });

  it('preserves the complete 30-player Box session contract', async () => {
    const starter = await BoxModule.getSessionStarterService();
    const accountClaimer = await BoxModule.getAccountClaimerService();

    const adminPlayer = await playerModel.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setName('lifecycle-admin')
        .setUniqueIdentifier('lifecycle-admin')
        .setProfileId(new ObjectId())
        .build(),
    );
    const adminProfile = await profileModel.create(
      ProfileBuilderFactory.getBuilder('Profile')
        .setUsername('lifecycle-admin')
        .build(),
    );
    const box = await boxModel.create(
      BoxBuilderFactory.getBuilder('Box')
        .setAdminPassword('lifecycle-admin-password')
        .setAdminPlayerId(new ObjectId(adminPlayer._id))
        .setAdminProfileId(new ObjectId(adminProfile._id))
        .setClansToCreate([
          { name: 'Lifecycle Clan 1' },
          { name: 'Lifecycle Clan 2' },
        ])
        .setTestersAmount(30)
        .setDailyTasks([])
        .build(),
    );

    const [started, startErrors] = await starter.start(box._id);
    expect(startErrors).toBeNull();
    expect(started).toBe(true);

    const startedBox = await boxModel.findById(box._id);
    expect(startedBox.createdClan_ids).toHaveLength(2);

    const startedClans = await Promise.all(
      startedBox.createdClan_ids.map((clanId) => clanModel.findById(clanId)),
    );
    expect(startedClans.map((clan) => clan.boxMemberLimit)).toEqual([15, 15]);
    expect(startedClans.map((clan) => clan.targetPoints)).toEqual([6300, 6300]);

    const expectedTaskTypes = [
      ...Object.values(ServerTaskName),
      ...Object.values(UITaskName),
    ];
    for (const clan of startedClans) {
      const tasks = await dailyTaskModel.find({ clan_id: clan._id });
      const taskTypes = tasks.map(({ type }) => type);

      expect(tasks).toHaveLength(BOX_SESSION_TASK_COUNT);
      expect(new Set(taskTypes).size).toBe(BOX_SESSION_TASK_COUNT);
      expect(taskTypes).toEqual(expect.arrayContaining(expectedTaskTypes));
    }

    for (let i = 0; i < 30; i++) {
      const [account, claimErrors] = await accountClaimer.claimAccount(
        startedBox.testersSharedPassword,
      );
      expect(claimErrors).toBeNull();
      expect(account).not.toBeNull();
    }

    const fullClans = await Promise.all(
      startedBox.createdClan_ids.map((clanId) => clanModel.findById(clanId)),
    );
    expect(fullClans.map((clan) => clan.playerCount)).toEqual([15, 15]);
    expect(fullClans.map((clan) => clan.targetPoints)).toEqual([6300, 6300]);
    expect(
      await playerModel.countDocuments({
        clan_id: { $in: startedBox.createdClan_ids },
      }),
    ).toBe(30);

    const [extraAccount, extraClaimErrors] = await accountClaimer.claimAccount(
      startedBox.testersSharedPassword,
    );
    expect(extraAccount).toBeNull();
    expect(extraClaimErrors).toContainSE_NOT_AUTHORIZED();

    const stateBeforeBlockedActions = await readSessionState(
      startedBox.createdClan_ids,
    );
    const guard = new BlockClanMutationInTestingSessionGuard();
    const blockedActions = ['create', 'join', 'leave', 'exclude', 'delete'];

    for (const action of blockedActions) {
      try {
        guard.canActivate();
        throw new Error(`${action} was not blocked`);
      } catch (error) {
        expect(error).toMatchObject({
          reason: APIErrorReason.CLAN_ACTION_BLOCKED_DURING_TESTING_SESSION,
          statusCode: 403,
        });
      }
    }

    const stateAfterBlockedActions = await readSessionState(
      startedBox.createdClan_ids,
    );
    expect(stateAfterBlockedActions).toEqual(stateBeforeBlockedActions);
  });

  async function readSessionState(clanIds: ObjectId[]) {
    const clans = await clanModel
      .find({ _id: { $in: clanIds } })
      .sort({ _id: 1 })
      .lean();

    return {
      clans: clans.map((clan) => ({
        _id: clan._id.toString(),
        playerCount: clan.playerCount,
        boxMemberLimit: clan.boxMemberLimit,
        targetPoints: clan.targetPoints,
      })),
      playerCount: await playerModel.countDocuments({
        clan_id: { $in: clanIds },
      }),
      taskCount: await dailyTaskModel.countDocuments({
        clan_id: { $in: clanIds },
      }),
    };
  }
});
